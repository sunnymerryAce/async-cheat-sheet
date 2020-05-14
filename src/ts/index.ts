/**
 * @author Yoichiro Hirano
 * @description Async Cheat Sheet
 * @created 2019/11/23
 */

const asyncResolver = (): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('resolved');
    }, 1000);
  });
};

const asyncRejecter = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // reject('rejected'); // NG: prefer-promise-reject-errors
      reject(new Error('rejected'));
    }, 1000);
  });
};

const asyncGetNumber = (number: number): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(number);
      resolve(number);
    }, number * 1000);
  });
};

const multipleAsyncResolver = (array: Array<any>): Promise<Array<any>> => {
  return Promise.all(array.map((number) => asyncGetNumber(number)));
};

const multipleAsyncRejecter = (array: Array<any>): Promise<Array<any>> => {
  const promises = array.map((number) => {
    return number % 2
      ? (asyncGetNumber(number) as Promise<number | string>)
      : (asyncRejecter() as Promise<number | string>);
  });
  return Promise.all(promises);
};

const asyncRejecterWrapper = async (): Promise<string> => {
  // return asyncRejecter()
  //   .then((res) => {
  //     console.log('then', res);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     Promise.reject(error);
  //   });
  const res: string = await asyncRejecter();
  console.log('asyncRejecterWrapperRES', res);
  return res;
};

const initialize = async () => {
  // 1. resolve
  const res1 = await asyncResolver();
  console.log('res1:', res1); // outputs 'resolved'

  // 2. reject with await/catch
  const res2 = await asyncRejecter().catch((error: Error) => {
    console.log('res2 error:', error.message); // outputs 'rejected'
  });
  console.log('res2:', res2); // outputs 'undefined' because catch() in asyncRejecter returns resolve(undefined)

  // 3. reject with try/catch
  try {
    const res3 = await asyncRejecter();
    console.log('res3:', res3); // not passed
  } catch (error) {
    console.log('res3 error:', error.message); // outputs 'rejected'
  }

  // 4. reject with await/catch and try/catch
  try {
    const res4 = await asyncRejecter().catch((error: Error) => {
      console.log('res4 error in await/catch:', error.message); // outputs 'rejected'
      return 'handled error';
    });
    console.log('res4:', res4); // outputs 'handled error'
  } catch (error) {
    console.log('res4 error in try/catch:', error.message); // not passed because asyncRejecter() has resolved
  }

  // 5. reject with await/catch and try/catch
  try {
    const res5 = await asyncRejecter().catch((error: Error) => {
      console.log('res5 error in await/catch:', error.message); // outputs 'rejected'
      throw new Error('error thrown in await/catch');
    });
    console.log('res5:', res5); // not passed
  } catch (error) {
    console.log('res5 error in try/catch:', error.message); // outputs 'error thrown in await/catch'
  }

  // 6. multiple resolve
  const res6 = await multipleAsyncResolver([1, 2, 3]);
  console.log('res6:', res6); // outputs [1, 2, 3]

  // 7. multiple reject with await/catch
  const res7 = await multipleAsyncRejecter([1, 2, 3]).catch((error: Error) => {
    console.log('res7 error:', error.message); // outputs 'rejected'
  });
  console.log('res7:', res7); // outputs 'undefined'

  // 8. asyncRejecterWrapper
  asyncRejecterWrapper()
    .then((res) => {
      // console.log(res);
      console.log('res8', res);
    })
    .catch((error) => {
      console.log('asyncRejecterWrapper error', error);
      return error;
    });

  // 8. reject without catch
  // const res8 = await asyncRejecter(); // Uncaught (in promise) Error: rejected
  // console.log('res8:', res8); // not passed
  // console.log('after case8'); // not passed
};

window.addEventListener('DOMContentLoaded', () => {
  initialize();
});
