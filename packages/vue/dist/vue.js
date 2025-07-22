var Vue = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    /**
     * 判断是否为一个数组
     */
    /**
     * 判断是否为对象
     */
    var isObject = function (val) { return val !== null && typeof val === 'object'; };
    /**
     * 判断值是否改变
     */
    var hasChanged = function (value, oldValue) { return !Object.is(value, oldValue); };
    /**
     * 判断是否为函数
     */
    var isFunction = function (val) { return typeof val === 'function'; };
    /**
     * 合并对象
     */
    var extend = Object.assign;
    /**
     * 空对象
     */
    var EMPTY_OBJ = Object.freeze({});

    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    var targetMap = new WeakMap();
    /**
     * 创建响应式副作用
     * @param fn 副作用函数
     */
    function effect(fn, options) {
        var _effect = new ReactiveEffect(fn);
        if (options) {
            extend(_effect, options);
        }
        if (!options || !options.lazy) {
            _effect.run();
        }
        return _effect;
    }
    // 当前激活的副作用函数
    var activeEffect = undefined;
    /**
     * 响应式副作用函数类
     */
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn, scheduler) {
            this.fn = fn;
            this.scheduler = scheduler;
            this.fn = fn;
            this.scheduler = scheduler;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        ReactiveEffect.prototype.stop = function () { };
        return ReactiveEffect;
    }());
    /**
     * 依赖收集
     * @param target 目标对象
     * @param key 目标对象的属性
     */
    function track(target, key) {
        // 如果当前没有激活的副作用函数，则直接返回(不需要收集依赖)
        if (!activeEffect)
            return;
        // 获取目标对象的依赖映射
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        // 设置目标对象属性的依赖
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    /**
     * 利用dep依次跟踪指定key的所有effect
     */
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    /**
     * 依赖触发
     * @param target 目标对象
     * @param key 目标对象的属性
     * @param value 目标对象的属性值
     */
    function trigger(target, key, value) {
        var depsMap = targetMap.get(target);
        if (!depsMap)
            return;
        // const effect = depsMap.get(key) as ReactiveEffect
        // if (!effect) return
        // effect.run()
        var dep = depsMap.get(key);
        if (!dep)
            return;
        triggerEffects(dep);
    }
    /**
     * 依次触发指定key的所有effect
     * @param dep 依赖
     */
    function triggerEffects(dep) {
        var effects = Array.isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        // 遍历effect依次触发，先执行computed的effect
        effects.forEach(function (effect) {
            if (effect.computed) {
                triggerEffect(effect);
            }
        });
        // 遍历effect依次触发，再执行普通effect
        effects.forEach(function (effect) {
            if (!effect.computed) {
                triggerEffect(effect);
            }
        });
    }
    /**
     * 触发指定effect
     * @param effect 副作用函数
     */
    function triggerEffect(effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }

    var get = createGetter();
    var set = createSetter();
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            // 收集依赖
            track(target, key);
            return res;
        };
    }
    function createSetter() {
        return function set(target, key, value, receiver) {
            var result = Reflect.set(target, key, value, receiver);
            // 触发依赖
            trigger(target, key);
            return result;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set
    };

    var reactiveMap = new WeakMap();
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandlers, proxyMap) {
        var existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        var proxy = new Proxy(target, baseHandlers);
        proxy["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */] = true;
        proxyMap.set(target, proxy);
        return proxy;
    }
    // 将值转换为响应式对象(泛型约束，传入什么类型就返回什么类型)
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };
    // 判断是否为响应式对象
    var isReactive = function (value) { return !!(value && value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]); };

    function isRef(r) {
        return !!(r && r.__v_isRef === true);
    }
    function ref(value) {
        return createRef(value, false);
    }
    /**
     * 主入口
     */
    function createRef(rowValue, shallow) {
        if (isRef(rowValue)) {
            return rowValue;
        }
        return new RefImpl(rowValue, shallow);
    }
    /**
     * ref实现类
     */
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShallow) {
            this.__v_isShallow = __v_isShallow;
            // 依赖数据
            this.dep = undefined;
            // 是否是ref数据类型
            this.__v_isRef = true;
            this._rawValue = value;
            this._value = __v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newVal) {
                if (hasChanged(newVal, this._rawValue)) {
                    this._rawValue = newVal;
                    this._value = toReactive(newVal);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    /**
     * 收集依赖
     */
    function trackRefValue(r) {
        if (activeEffect) {
            trackEffects(r.dep || (r.dep = createDep()));
        }
    }
    /**
     * 触发依赖
     */
    function triggerRefValue(r) {
        if (r.dep) {
            triggerEffects(r.dep);
        }
    }

    var ComputedRefImpl = /** @class */ (function () {
        function ComputedRefImpl(getter) {
            var _this = this;
            this.dep = undefined;
            this.__v_isRef = true;
            // 是否是脏的，创建实例时即为true
            this._dirty = true;
            // 传入getter和调度器
            this.effect = new ReactiveEffect(getter, function () {
                // 使用dirty标识状态避免死循环
                if (!_this._dirty) {
                    _this._dirty = true;
                    triggerRefValue(_this);
                }
            });
            // 将computed实例赋值给effect的computed属性
            this.effect.computed = this;
        }
        Object.defineProperty(ComputedRefImpl.prototype, "value", {
            get: function () {
                // 收集依赖
                trackRefValue(this);
                // 如果计算属性是脏的，则执行effect的run方法，初始化计算属性的值并触发响应式数据的依赖收集
                if (this._dirty) {
                    this._dirty = false;
                    // 执行effect的run方法，初始化计算属性的值并触发响应式数据的依赖收集
                    this._value = this.effect.run();
                }
                // 返回计算属性的值
                return this._value;
            },
            set: function (newValue) { },
            enumerable: false,
            configurable: true
        });
        return ComputedRefImpl;
    }());
    function computed(getterOrOptions) {
        var getter;
        var onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            getter = getterOrOptions;
        }
        else {
            getter = getterOrOptions.get;
        }
        return new ComputedRefImpl(getter);
    }

    var isFlushPending = false;
    // 缓存任务队列
    var pendingPreFlushCbs = [];
    // 创建一个微任务
    var resolvePromise = Promise.resolve();
    /**
     * 将回调函数添加到任务队列中
     * @param cb 回调函数
     */
    function queuePreFlushCb(cb) {
        queueCb(cb, pendingPreFlushCbs);
    }
    function queueCb(cb, pendingQueue) {
        pendingQueue.push(cb);
        queueFlush();
    }
    function queueFlush() {
        if (!isFlushPending) {
            isFlushPending = true;
            resolvePromise.then(flushJobs);
        }
    }
    function flushJobs() {
        isFlushPending = false;
        flushPreFlushCbs();
    }
    function flushPreFlushCbs() {
        if (pendingPreFlushCbs.length) {
            // 深拷贝并去重任务队列
            var activePreFlushCbs = __spreadArray([], __read(new Set(pendingPreFlushCbs)), false);
            // 清空任务队列
            pendingPreFlushCbs.length = 0;
            for (var i = 0; i < activePreFlushCbs.length; i++) {
                activePreFlushCbs[i]();
            }
        }
    }

    function watch(source, cb, options) {
        return doWatch(source, cb, options);
    }
    function doWatch(source, cb, _a) {
        var _b = _a === void 0 ? EMPTY_OBJ : _a, immediate = _b.immediate, deep = _b.deep;
        var getter;
        if (isReactive(source)) {
            getter = function () { return source; };
            deep = true;
        }
        else {
            getter = function () { };
        }
        // 如果需要深度监听，则需要创建一个代理对象，并进行依赖收集
        if (cb && deep) {
            var baseGetter_1 = getter;
            getter = function () { return traverse(baseGetter_1()); };
        }
        var oldValue = {};
        // job函数执行相当于watch执行
        var job = function () {
            if (cb) {
                var newValue = effect.run();
                if (deep || hasChanged(newValue, oldValue)) {
                    cb(newValue, oldValue);
                    oldValue = newValue;
                }
            }
        };
        // 创建调度器
        var scheduler = function () { return queuePreFlushCb(job); };
        var effect = new ReactiveEffect(getter, scheduler);
        if (cb) {
            // 立即执行直接调用job
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else {
            effect.run();
        }
        return function () {
            effect.stop();
        };
    }
    // 依赖收集,递归调用访问一次所有的变量进行依赖收集
    function traverse(value) {
        if (!isObject(value))
            return value;
        for (var key in value) {
            traverse(value[key]);
        }
        return value;
    }

    exports.computed = computed;
    exports.effect = effect;
    exports.queuePreFlushCb = queuePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.watch = watch;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=vue.js.map
