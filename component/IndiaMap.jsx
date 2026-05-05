"use client";

export default function IndiaMap({ states, setActiveState }) {
  const mapStates = [
    "ASSAM",
    "BIHAR",
    "UTTAR PRADESH",
    "ARUNACHAL PRADESH",
  ];

  return (
    <div className="mt-10 flex flex-wrap justify-center gap-3">
      {mapStates.map((name) => {
        const found = states.find(
          (s) => s.name.toUpperCase() === name
        );

        return (
          <button
            key={name}
            onClick={() => found && setActiveState(found)}
            className="px-4 py-2 rounded-full bg-gray-800 hover:bg-white hover:text-black transition"
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}