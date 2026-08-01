"""Per-production budget ledger with cap enforcement."""

from __future__ import annotations

from typing import Any

from store import Production


class Budget:
    def __init__(self, prod: Production) -> None:
        self.prod = prod
        self.cap = prod.budget_cap_usd or 0.0

    @property
    def spent(self) -> float:
        return self.prod.costs.get("total_usd", 0.0)

    def add(self, label: str, amount: float) -> None:
        if amount <= 0:
            return
        with self.prod.lock:
            items = self.prod.costs.setdefault("items", [])
            items.append({"label": label, "amount": round(amount, 4), "ts": self.prod.updated_at})
            self.prod.costs["total_usd"] = round(self.spent + amount, 4)
        self.prod.emit(self.prod, "cost", label=label, amount=round(amount, 4), total=self.spent)
        if self.cap > 0 and self.spent >= self.cap:
            self.prod.emit(self.prod, "budget.warning", spent=self.spent, cap=self.cap)

    def would_exceed(self, amount: float) -> bool:
        return self.cap > 0 and (self.spent + amount) > self.cap

    def ensure_headroom(self, amount: float) -> bool:
        """True when adding amount is allowed under the cap."""
        return not self.would_exceed(amount)
