const Header = ({ Detail, Title }) => {
  return (
    <section className="w-full  relative px-5% py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex  flex-col justify-center items-center text-center">
          <p className="uppercase tracking-[0.05em] text-xl text-blue font-semibold mb-4 ">
            {Detail}
          </p>
          <h1 className="text-3xl">{Title}</h1>
        </div>
      </div>
    </section>
  );
};

export default Header;
