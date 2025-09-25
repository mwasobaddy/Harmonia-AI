export default function ServiceCard({ title, description, price }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">
        {description}
      </p>
      <p className="mt-4 text-2xl font-bold text-gray-900">{price}</p>
    </div>
  )
}