import { RefObject, useCallback } from "react";
import { RefCallBack } from "react-hook-form";

/**
 * Convenience hook for using the RHF RefCallback to ensure stable reference between re-renders.
 * @param refCallback - a RefCallback function from RHF.
 * @param refObject - an optional RefObject created from React.useRef or React.createRef.
 * @returns handleRefCallback - a memoized callback.
 */
const useRefCallback = <T extends Element>(
  refCallback: RefCallBack,
  refObject?: RefObject<T | null>
) => {
  const handleRefCallback = useCallback(
    (ref: T) => {
      refCallback(ref);

      if (refObject) {
        refObject.current = ref;
      }
    },
    [refCallback]
  );

  return handleRefCallback;
};

export default useRefCallback;
