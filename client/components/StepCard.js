export default function StepCard({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-blue-500 text-white text-xl font-bold">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
    </div>
  )
}