import React, {useState} from 'react'
import axios from 'axios'

const QUESTIONS = [
  {id:'work', q:"Tell me about your work (profession, qualification, hours)."},
  {id:'who', q:"Who will receive this mitigation statement?"},
  {id:'facts', q:"Briefly describe the incident/charges."},
  {id:'personal', q:"Any personal circumstances to share (children, health, finances)?"},
  {id:'mitigation', q:"Have you taken any remedial steps or trainings?"}
]

export default function FormPage(){
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function handleChange(e){
    setAnswers({...answers, [QUESTIONS[index].id]: e.target.value})
  }

  async function handleNext(){
    if(index < QUESTIONS.length -1) {
      setIndex(index+1)
    }
  }

  async function handleBack(){
    setIndex(Math.max(0, index-1))
  }

  async function handleSubmit(){
    setLoading(true)
    try{
      const payload = {answers, prompt: 'medical'}
      const resp = await axios.post('/api/generate', payload)
      setResult(resp.data)
    }catch(e){
      setResult({error: e.message})
    }finally{setLoading(false)}
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Hybrid conversational form</h2>
      <div className="bg-white p-4 rounded shadow">
        <p className="mb-2">{QUESTIONS[index].q}</p>
        <textarea className="w-full border p-2 mb-2" rows={4} value={answers[QUESTIONS[index].id]||''} onChange={handleChange} />
        <div className="flex gap-2">
          <button onClick={handleBack} className="px-3 py-1 bg-gray-200 rounded">Back</button>
          {index < QUESTIONS.length-1 ? (
            <button onClick={handleNext} className="px-3 py-1 bg-blue-600 text-white rounded">Next</button>
          ) : (
            <button onClick={handleSubmit} className="px-3 py-1 bg-green-600 text-white rounded">Submit & Pay (Stripe placeholder)</button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Progress</h3>
        <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(answers, null, 2)}</pre>
      </div>

      <div className="mt-6">
        {loading && <div>Generating...</div>}
        {result && <div className="bg-white p-4 rounded shadow"><h4>Result</h4><pre>{JSON.stringify(result, null, 2)}</pre></div>}
      </div>
    </div>
  )
}
