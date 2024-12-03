const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-500 to bg-indigo-600 dark:from-gray-800 dark:to-gray-900 py-16 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-4xl font-bold mb-4">
          Find the best courses for You
        </h1>
        <p className="text-gray-200 dark:text-gray-400">
          Discover, learn and Upskill with our wide range of courses
        </p>

        <form action="">
          <input
            type="text"
            className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-white dark:text-gray-100 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto mb-6"
          />
        </form>
      </div>
    </div>
  );
};

export default HeroSection;
