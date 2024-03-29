import React from "react";

function CreateRoom(props) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="rounded-lg bg-gray-900">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-x-16 gap-y-16 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {props.name}
          </h2>
          <div className="mt-6 space-y-6">
            <div className="relative">
              <input
                className="w-full rounded-[7px] border border-blue-gray-200 bg-transparent px-3 py-2.5 text-sm font-normal text-blue-gray-700 outline-none focus:border-2 focus:border-gray-900"
                placeholder={props.placeholder1}
              />
            </div>
            <div className="relative flex items-center w-full rounded-[7px] bg-gray-100">
              <input
                type="text"
                className="flex-grow rounded-l-[7px] border-t border-b border-l border-blue-gray-200 bg-transparent px-3 py-2.5 text-sm font-normal text-blue-gray-700 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder={props.placeholder2}
              />
              <button
                className="rounded-none bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-400"
                type="button"
              >
                Generate
              </button>
              <button
                className="bg-green-500 px-4 py-2 rounded-r-[7px] text-sm font-semibold text-white transition-all hover:bg-green-400"
                type="button"
              >
                Copy
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus:outline-none"
              >
                {props.button}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
