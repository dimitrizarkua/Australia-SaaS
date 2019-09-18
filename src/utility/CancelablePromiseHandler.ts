export interface ICancelablePromise {
  isCancelled: () => boolean;
  doCancel: () => void;
  asyncHandler: (func: () => any) => Promise<any>;
}

export const promiseIsCancelled = 'PromiseIsCancelled';

const cancelablePromiseHandler = (): ICancelablePromise => {
  let cancel = false;
  const isCancelled = () => cancel;
  const doCancel = () => {
    cancel = true;
  };
  const asyncHandler = async (func: () => any) => {
    const res = await func();

    if (!cancel) {
      return res;
    } else {
      throw promiseIsCancelled;
    }
  };

  return {
    isCancelled,
    doCancel,
    asyncHandler
  };
};

export default cancelablePromiseHandler;
