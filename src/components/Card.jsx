const Card = ({ icon, title, value }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between text-gray-500">
        {icon}
      </div>

      <p className="text-xs text-gray-500">{title}</p>

      <p className="text-xl font-semibold text-gray-800">{value}</p>
    </div>
  );
};

export default Card;
