export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 w-full mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-6 py-6 gap-4 max-w-7xl mx-auto">
        <div className="text-lg font-semibold">
          Last Race
        </div>
        <div className="text-xs uppercase text-neutral-500">
          Politecnico di Torino · Web Applications I
        </div>
      </div>
    </footer>
  );
}
