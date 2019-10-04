/**
 * Created by long.nguyen on 5/3/2017.
 */
bb.collection = {};
bb.collection.filterBy = function (arrObject, conditionFunc, param) {
    var arr = null;
    for (var i = 0; i < arrObject.length; i++) {
        if (conditionFunc(arrObject[i], param)) {
            !arr && (arr = []);
            arr.push(arrObject[i]);
        }
    }
    return arr;
};

bb.collection.findBy = function (arrObject, conditionFunc, param) {
    var obj = null;
    for (var i = 0; i < arrObject.length; i++) {
        if (conditionFunc(arrObject[i], param)) {
            obj = arrObject[i];
            break;
        }
    }
    return obj;
};

bb.collection.findSameBetween = function (arrObj1, arrObj2, conditionFunc, cb) {
    if (arrObj1 && arrObj2) {
        for (var i1 = 0; i1 < arrObj1.length; i1++) {
            for (var i2 = 0; i2 < arrObj2.length; i2++) {
                if (conditionFunc(arrObj1[i1], arrObj2[i2], i1, i2)) {
                    cb(arrObj1[i1], arrObj2[i2], i1, i2);
                }
            }
        }
    }
};

bb.collection.removeBy = function (arrObject, conditionFunc, param) {
    var obj = null;
    for (var i = 0; i < arrObject.length; i++) {
        if (conditionFunc(arrObject[i], param)) {
            arrObject.splice(i, 1);
            obj = arrObject[i];
            break;
        }
    }
    return obj;
};

bb.collection.updateBy = function (arrObject, updateObj, conditionFunc, param) {
    var obj = null;
    for (var i = 0; i < arrObject.length; i++) {
        if (conditionFunc(arrObject[i], param)) {
            arrObject[i] = updateObj;
            obj = updateObj;
            break;
        }
    }
    return obj;
};

bb.collection.findBestWith = function (arrObject, compareFunc) {
    if (arrObject.length > 0) {
        var bestObj = arrObject[0];
        for (var i = 1; i < arrObject.length; i++) {
            if (compareFunc(arrObject[i], bestObj)) {
                bestObj = arrObject[i];
            }
        }
        return bestObj;
    }
    return null;
};

bb.collection.createArray = function (numElement, func) {
    var arr = new Array(numElement);
    for (var i = 0; i < numElement; i++) {
        arr[i] = func(i);
    }
    return arr;
};

bb.collection.sortBy = function (arrObject, compareFunc) {
    arrObject.sort(compareFunc);
};

bb.collection.arrayClone = function (arr) {
    return cc.copyArray(arr);
};

bb.collection.arrayAppendArray = function (arr, arrAppend, index) {
    index = index || arr.length;
    var pIndex = index;
    var length = arr.length + arrAppend.length;
    var newArr = new Array(length);
    var sliceArr = null;
    for (var i = 0; i < pIndex; i++) {
        newArr[i] = arr[i];
    }
    if (pIndex > 0) {
        var sliceArr = arr.slice(index, arr.length);
    }
    for (var i = 0; i < arrAppend.length; i++) {
        newArr[pIndex++] = arrAppend[i];
    }
    if (sliceArr) {
        for (var i = 0; i < sliceArr.length; i++) {
            newArr[pIndex++] = sliceArr[i];
        }
    }
    return newArr;
};

bb.collection.arrayORArray = function (arr1, arr2, filterFunc) {
    var cpArr1 = cc.copyArray(arr1);
    var cpArr2 = cc.copyArray(arr2);
    var sameArr = [];
    for (var i1 = cpArr1.length - 1; i1 >= 0; i1--) {
        for (var i2 = cpArr2.length - 1; i2 >= 0; i2--) {
            if (filterFunc(cpArr1[i1], cpArr2[i2])) {
                sameArr.push(cpArr1[i1]);
                cpArr1.splice(i1, 1);
                cpArr2.splice(i2, 1);
                break;
            }
        }
    }
    var arrResults = new Array(cpArr1.length + cpArr2.length + sameArr.length);
    var index = 0;
    for (var i = 0; i < cpArr1.length; i++) {
        arrResults[index++] = cpArr1[i];
    }
    for (var i = sameArr.length - 1; i >= 0; i--) {
        arrResults[index++] = sameArr[i];
    }
    for (var i = 0; i < cpArr2.length; i++) {
        arrResults[index++] = cpArr2[i];
    }
    return arrResults;
};

bb.collection.arrayANDArray = function (arr1, arr2, filterFunc) {
    var arrResults = [];
    if (arr1 && arr2 && filterFunc) {
        for (var i1 = 0; i1 < arr1.length; i1++) {
            for (var i2 = 0; i2 < arr2.length; i2++) {
                if (filterFunc(arr1[i1], arr2[i2])) {
                    arrResults.push(arr1[i1]);
                }
            }
        }
    }
    return arrResults;
};

bb.collection.arrayXORArray = function (arr1, arr2, filterFunc) {
    var cpArr1 = cc.copyArray(arr1);
    var cpArr2 = cc.copyArray(arr2);
    for (var i1 = cpArr1.length - 1; i1 >= 0; i1--) {
        for (var i2 = cpArr2.length - 1; i2 >= 0; i2--) {
            if (filterFunc(cpArr1[i1], cpArr2[i2])) {
                cpArr1.splice(i1, 1);
                cpArr2.splice(i2, 1);
                break;
            }
        }
    }
    var arrResults = new Array(cpArr1.length + cpArr2.length);
    var index = 0;
    for (var i = 0; i < cpArr1.length; i++) {
        arrResults[index++] = cpArr1[i];
    }
    for (var i = 0; i < cpArr2.length; i++) {
        arrResults[index++] = cpArr2[i];
    }
    return arrResults;
};

var BBRandom = function (nseed) {

    var seed,
        constant = Math.pow(2, 13) + 1,
        prime = 37,
        maximum = Math.pow(2, 50);

    if (nseed) {
        seed = nseed;
    }

    if (seed == null) {
        //if there is no seed, use timestamp
        seed = (new Date()).getTime();
    }

    return {
        next: function () {
            seed *= constant;
            seed += prime;
            seed %= maximum;
            return seed;
        }
    }
}

bb.collection.getRandom = function (seed) {
    return new BBRandom(seed);
};