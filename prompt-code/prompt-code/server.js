const express = require('express');
const { app } = require('./app');

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PromptPro Arena server running on http://localhost:${PORT}`);
});
