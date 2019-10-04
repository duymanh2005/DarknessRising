/**
 * Created by longnguyen on 4/12/2016.
 */
(function (ctx) {

    var ObjectComparator = ctx.ObjectComparator = function () {

    };

    ObjectComparator.prototype = {
        constructor: ObjectComparator,
        compareBy: function (object1, object2) {
            return 0;
        },

        reverse: function () {
            return new ObjectReverseComparator(this);
        }

    };

    var ObjectReverseComparator = ctx.ObjectReverseComparator = function (comparator) {
        this.comparator = comparator;
    };
    ctx.extendClass(ObjectReverseComparator, ObjectComparator);

    ObjectReverseComparator.prototype = {
        constructor: ObjectReverseComparator,
        compareBy: function (object1, object2) {
            return this.compareBy(object2, object1);
        }
    };

})(bobo.core);