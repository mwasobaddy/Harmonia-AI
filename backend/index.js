const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Load sample prompt/context (acting as RAG context) from prompt.txt
const promptPath = path.join(__dirname, '..', 'prompt.txt')
let promptText = ''
try{
  promptText = fs.readFileSync(promptPath, 'utf8')
}catch(e){
  console.warn('Could not load prompt.txt; continue with empty context')
}

app.post('/api/generate', async (req, res) => {
  // Minimal stub: return a pseudo-generated mitigation statement using prompt template + user answers.
  const {answers, prompt} = req.body || {}

  // Combine inputs into a single body for passing to Claude in production
  const combined = `Client answers:\n${JSON.stringify(answers, null, 2)}\n\nPrompt template:\n${promptText.substring(0, 2000)}`

  // TODO: Replace with Claude API call + Pinecone retrieval in production
  const generated = `This is a placeholder mitigation statement generated from the provided answers.\n\nSummary of answers:\n${JSON.stringify(answers, null, 2)}\n\n[Note: In production this would call Claude with RAG context from Pinecone and your prompt template.]`

  res.json({ok:true, generated, combined})
})

app.get('/api/health', (req,res)=> res.json({ok:true, uptime: process.uptime()}))

const port = process.env.PORT || 5000
app.listen(port, ()=> console.log(`Backend running on ${port}`))
