const STATUS = {
    PENDING: 'pending',//等待
    FULFILLED: 'fulfilled',//成功
    REJECTED: 'rejected'//失败
};

function Promise(executor) {
    let self = this;
    self.status = STATUS.PENDING;//状态
    self.value = undefined;//成功时传给成功回调的数据
    self.reason = undefined;//失败时传给失败回调的数据
    //then方法是能多次使用的，所以我们用数组来存多个回调
    self.onResolvedCallbacks = [];
    self.onRejectedCallbacks = [];

    function resolve(value) {
        if (self.status === STATUS.PENDING) {
            self.status = STATUS.FULFILLED;
            self.value = value;
            //当成功的函数被调用的时候，调用之前缓存的回调函数
            self.onResolvedCallbacks.forEach(fn => fn());
        }
    }

    function reject(reason) {
        if (self.status === STATUS.PENDING) {
            self.status = STATUS.REJECTED;
            self.reason = reason;
            self.onRejectedCallbacks.forEach(fn => fn());
        }
    }

    //抛错误的时候也是reject
    try {
        executor(resolve, reject);//执行执行器函数
    } catch (e) {
        reject(e)
    }

}

//实现链式调用的原理是：返回一个新的Promise
Promise.prototype.then = function (onFulfilled, onRejected) {
    let self = this;
    let Promise2;

    //then里面没有写任何操作的话
    onFulfilled = typeof  onFulfilled === 'function' ?
        onFulfilled :
        function (value) {
            return value;
        };
    onRejected = typeof onRejected === 'function' ?
        onRejected :
        function (reason) {
            return reason;
        };

    const tryCatchFulFill = function (resolve, reject) {
        try {
            //接收上一次then的返回值
            let x = onFulfilled(self.value);
            resolve(x);
        } catch (e) {
            reject(e);
        }
    };
    const tryCatchReject = function (resolve, reject) {
        try {
            let x = onRejected(self.reason);
            resolve(x);
        } catch (e) {
            reject(e);
        }
    };

    switch (self.status) {
        case STATUS.FULFILLED:
            //返回一个 promise，才可以进行链式调用，他也有then的方法
         Promise2 = new Promise(tryCatchFulFill);
            break;
        case STATUS.REJECTED:
            Promise2 = new Promise(tryCatchReject);
            break;
        case STATUS.PENDING:
            //executor是异步的话，当then执行时候，状态还没有改变，还是pending
            Promise2 = new Promise(function (resolve, reject) {
                //缓存回调函数，等状态改变之后再执行，直接放在resolve里面就可以了
                self.onResolvedCallbacks.push(tryCatchFulFill.bind(resolve, reject));
                self.onRejectedCallbacks.push(tryCatchReject.bind(resolve, reject));
            });
            break;
    }
    return Promise2;
};
module.exports = Promise;