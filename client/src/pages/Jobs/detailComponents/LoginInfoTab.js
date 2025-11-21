 

export const LoginInfoTab = ({ clientDetail }) => {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-tl-md">
          CT Login
        </span>
        <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2 rounded-tr-md">
          <>
            <span className="w-full">
              {clientDetail?.ctLogin ? (
                clientDetail?.ctLogin
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
            <hr className="w-[2px] h-full bg-gray-300" />
            <span className="w-full">
              {clientDetail?.ctPassword ? (
                clientDetail?.ctPassword
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border  border-gray-300 text-black font-medium  py-2 px-2 ">
          PYE Login
        </span>
        <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2">
          <>
            <span className="w-full">
              {clientDetail?.pyeLogin ? (
                clientDetail?.pyeLogin
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
            <hr className="w-[2px] h-full bg-gray-300" />
            <span className="w-full">
              {clientDetail?.pyePassword ? (
                clientDetail?.pyePassword
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          TR Login
        </span>
        <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2  ">
          <>
            <span className="w-full">
              {clientDetail?.trLogin ? (
                clientDetail?.trLogin
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
            <hr className="w-[2px] h-full bg-gray-300" />
            <span className="w-full">
              {clientDetail?.trPassword ? (
                clientDetail?.trPassword
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          VAT Login
        </span>
        <span className="border flex items-center gap-1 border-gray-300 text-gray-600 py-2 px-2 ">
          <>
            <span className="w-full">
              {clientDetail?.vatLogin ? (
                clientDetail?.vatLogin
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
            <hr className="w-[2px] h-full bg-gray-300" />
            <span className="w-full">
              {clientDetail?.vatPassword ? (
                clientDetail?.vatPassword
              ) : (
                <span className="text-red-500">N/A</span>
              )}
            </span>
          </>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 ">
          Authentication Code
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 ">
          <span className=" py-1 px-5 rounded-[1.5rem] shadow-md bg-teal-500 text-white">
            {clientDetail?.authCode ? (
              clientDetail?.authCode
            ) : (
              <span className="text-red-500">N/A</span>
            )}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
          UTR
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
          {clientDetail?.utr ? (
            clientDetail?.utr
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2">
        <span className="border border-gray-300 text-black font-medium py-2 px-2 rounded-bl-md ">
          Personal Code
        </span>
        <span className="border border-gray-300 text-gray-600 py-2 px-2 rounded-br-md ">
          {clientDetail?.personalCode ? (
            clientDetail?.personalCode
          ) : (
            <span className="text-red-500">N/A</span>
          )}
        </span>
      </div>


    </div>
  );
};
