import 'core-js';
import {protocol,metadata} from 'aurelia-metadata';
import {AggregateError} from 'aurelia-pal';

/**
* Decorator: Indicates that the decorated class/object is a custom resolver.
*/
export const resolver: Function = protocol.create('aurelia:resolver', function(target) {
  if (!(typeof target.get === 'function')) {
    return 'Resolvers must implement: get(container: Container, key: any): any';
  }

  return true;
});

/**
* Used to allow functions/classes to specify custom dependency resolution logic.
*/
interface Resolver {
  /**
  * Called by the container to allow custom resolution of dependencies for a function/class.
  * @param container The container to resolve from.
  * @param key The key that the resolver was registered as.
  * @return Returns the resolved object.
  */
  get(container: Container, key: any): any;
}

/**
* Used to allow functions/classes to specify lazy resolution logic.
*/
@resolver()
export class Lazy {
  /**
  * Creates an instance of the Lazy class.
  * @param key The key to lazily resolve.
  */
  constructor(key: any) {
    this._key = key;
  }

  /**
  * Called by the container to lazily resolve the dependency into a lazy locator function.
  * @param container The container to resolve from.
  * @return Returns a function which can be invoked at a later time to obtain the actual dependency.
  */
  get(container: Container): any {
    return () => container.get(this._key);
  }

  /**
  * Creates a Lazy Resolver for the supplied key.
  * @param key The key to lazily resolve.
  * @return Returns an insance of Lazy for the key.
  */
  static of(key: any): Lazy {
    return new Lazy(key);
  }
}

/**
* Used to allow functions/classes to specify resolution of all matches to a key.
*/
@resolver()
export class All {
  /**
  * Creates an instance of the All class.
  * @param key The key to lazily resolve all matches for.
  */
  constructor(key: any) {
    this._key = key;
  }

  /**
  * Called by the container to resolve all matching dependencies as an array of instances.
  * @param container The container to resolve from.
  * @return Returns an array of all matching instances.
  */
  get(container: Container): any[] {
    return container.getAll(this._key);
  }

  /**
  * Creates an All Resolver for the supplied key.
  * @param key The key to resolve all instances for.
  * @return Returns an insance of All for the key.
  */
  static of(key: any): All {
    return new All(key);
  }
}

/**
* Used to allow functions/classes to specify an optional dependency, which will be resolved only if already registred with the container.
*/
@resolver()
export class Optional {
  /**
  * Creates an instance of the Optional class.
  * @param key The key to optionally resolve for.
  * @param checkParent Indicates whether or not the parent container hierarchy should be checked.
  */
  constructor(key: any, checkParent?: boolean = false) {
    this._key = key;
    this._checkParent = checkParent;
  }

  /**
  * Called by the container to provide optional resolution of the key.
  * @param container The container to resolve from.
  * @return Returns the instance if found; otherwise null.
  */
  get(container: Container): any {
    if (container.hasResolver(this._key, this._checkParent)) {
      return container.get(this._key);
    }

    return null;
  }

  /**
  * Creates an Optional Resolver for the supplied key.
  * @param key The key to optionally resolve for.
  * @param [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
  * @return Returns an insance of Optional for the key.
  */
  static of(key: any, checkParent?: boolean = false): Optional {
    return new Optional(key, checkParent);
  }
}


/**
* Used to inject the dependency from the parent container instead of the current one.
*/
@resolver()
export class Parent {
  /**
  * Creates an instance of the Parent class.
  * @param key The key to resolve from the parent container.
  */
  constructor(key: any) {
    this._key = key;
  }

  /**
  * Called by the container to load the dependency from the parent container
  * @param container The container to resolve the parent from.
  * @return Returns the matching instance from the parent container
  */
  get(container: Container): any {
    return container.parent
      ? container.parent.get(this._key)
      : null;
  }

  /**
  * Creates a Parent Resolver for the supplied key.
  * @param key The key to resolve.
  * @return Returns an insance of Parent for the key.
  */
  static of(key: any) : Parent {
    return new Parent(key);
  }
}

@resolver()
export class StrategyResolver {
  /**
  * Creates an instance of the StrategyResolver class.
  * @param strategy The type of resolution strategy.
  * @param state The state associated with the resolution strategy.
  */
  constructor(strategy, state) {
    this.strategy = strategy;
    this.state = state;
  }

  /**
  * Called by the container to allow custom resolution of dependencies for a function/class.
  * @param container The container to resolve from.
  * @param key The key that the resolver was registered as.
  * @return Returns the resolved object.
  */
  get(container: Container, key: any): any {
    switch (this.strategy) {
    case 0: //instance
      return this.state;
    case 1: //singleton
      let singleton = container.invoke(this.state);
      this.state = singleton;
      this.strategy = 0;
      return singleton;
    case 2: //transient
      return container.invoke(this.state);
    case 3: //function
      return this.state(container, key, this);
    case 4: //array
      return this.state[0].get(container, key);
    case 5: //alias
      return container.get(this.state);
    default:
      throw new Error('Invalid strategy: ' + this.strategy);
    }
  }
}

/**
* Decorator: Specifies a custom Invoker for the decorated item.
*/
export function invoker(value: Invoker): any {
  return function(target) {
    metadata.define(metadata.invoker, value, target);
  };
}

/**
* Decorator: Specifies that the decorated item should be called as a factory function, rather than a constructor.
*/
export function factory(potentialTarget?: any): any {
  let deco = function(target) {
    metadata.define(metadata.invoker, FactoryInvoker.instance, target);
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* A strategy for invoking a function, resulting in an object instance.
*/
interface Invoker {
  /**
  * Invokes the function with the provided dependencies.
  * @param fn The constructor or factory function.
  * @param dependencies The dependencies of the function call.
  * @return The result of the function invocation.
  */
  invoke(container: Container, fn: Function, dependencies: any[]): any;

  /**
  * Invokes the function with the provided dependencies.
  * @param fn The constructor or factory function.
  * @param staticDependencies The static dependencies of the function.
  * @param dynamicDependencies Additional dependencies to use during invocation.
  * @return The result of the function invocation.
  */
  invokeWithDynamicDependencies(container: Container, fn: Function, staticDependencies: any[], dynamicDependencies: any[]): any;
}

/**
* An Invoker that is used to invoke a factory method.
*/
export class FactoryInvoker {
  /**
  * The singleton instance of the FactoryInvoker.
  */
  static instance = new FactoryInvoker();

  /**
  * Invokes the function with the provided dependencies.
  * @param container The calling container.
  * @param fn The constructor or factory function.
  * @param dependencies The dependencies of the function call.
  * @return The result of the function invocation.
  */
  invoke(container: Container, fn: Function, dependencies: any[]): any {
    let i = dependencies.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(dependencies[i]);
    }

    return fn.apply(undefined, args);
  }

  /**
  * Invokes the function with the provided dependencies.
  * @param container The calling container.
  * @param fn The constructor or factory function.
  * @param staticDependencies The static dependencies of the function.
  * @param dynamicDependencies Additional dependencies to use during invocation.
  * @return The result of the function invocation.
  */
  invokeWithDynamicDependencies(container: Container, fn: Function, staticDependencies: any[], dynamicDependencies: any[]): any {
    let i = staticDependencies.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(staticDependencies[i]);
    }

    if (dynamicDependencies !== undefined) {
      args = args.concat(dynamicDependencies);
    }

    return fn.apply(undefined, args);
  }
}

/**
* Decorator: Specifies a custom registration strategy for the decorated class/function.
*/
export function registration(value: Registration): any {
  return function(target) {
    metadata.define(metadata.registration, value, target);
  };
}

/**
* Decorator: Specifies to register the decorated item with a "transient" lifetime.
*/
export function transient(key?: any): any {
  return registration(new TransientRegistration(key));
}

/**
* Decorator: Specifies to register the decorated item with a "singleton" lieftime.
*/
export function singleton(keyOrRegisterInChild?: any, registerInChild?: boolean = false): any {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

/**
* Customizes how a particular function is resolved by the Container.
*/
interface Registration {
  /**
  * Called by the container to register the resolver.
  * @param container The container the resolver is being registered with.
  * @param key The key the resolver should be registered as.
  * @param fn The function to create the resolver for.
  * @return The resolver that was registered.
  */
  registerResolver(container: Container, key: any, fn: Function): Resolver;
}

/**
* Used to allow functions/classes to indicate that they should be registered as transients with the container.
*/
export class TransientRegistration {
  /**
  * Creates an instance of TransientRegistration.
  * @param key The key to register as.
  */
  constructor(key?: any) {
    this._key = key;
  }

  /**
  * Called by the container to register the resolver.
  * @param container The container the resolver is being registered with.
  * @param key The key the resolver should be registered as.
  * @param fn The function to create the resolver for.
  * @return The resolver that was registered.
  */
  registerResolver(container: Container, key: any, fn: Function): Resolver {
    let resolver = new StrategyResolver(2, fn);
    container.registerResolver(this._key || key, resolver);
    return resolver;
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
*/
export class SingletonRegistration {
  /**
  * Creates an instance of SingletonRegistration.
  * @param key The key to register as.
  */
  constructor(keyOrRegisterInChild?: any, registerInChild?: boolean = false) {
    if (typeof keyOrRegisterInChild === 'boolean') {
      this._registerInChild = keyOrRegisterInChild;
    } else {
      this._key = keyOrRegisterInChild;
      this._registerInChild = registerInChild;
    }
  }

  /**
  * Called by the container to register the resolver.
  * @param container The container the resolver is being registered with.
  * @param key The key the resolver should be registered as.
  * @param fn The function to create the resolver for.
  * @return The resolver that was registered.
  */
  registerResolver(container: Container, key: any, fn: Function): Resolver {
    let resolver = new StrategyResolver(1, fn);

    if (this._registerInChild) {
      container.registerResolver(this._key || key, resolver);
    } else {
      container.root.registerResolver(this._key || key, resolver);
    }

    return resolver;
  }
}

const badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';
export const _emptyParameters = Object.freeze([]);

metadata.registration = 'aurelia:registration';
metadata.invoker = 'aurelia:invoker';

let resolverDecorates = resolver.decorates;

/**
* Stores the information needed to invoke a function.
*/
export class InvocationHandler {
  /**
  * The function to be invoked by this handler.
  */
  fn: Function;

  /**
  * The invoker implementation that will be used to actually invoke the function.
  */
  invoker: Invoker;

  /**
  * The statically known dependencies of this function invocation.
  */
  dependencies: any[];

  /**
  * Instantiates an InvocationDescription.
  * @param fn The Function described by this description object.
  * @param invoker The strategy for invoking the function.
  * @param dependencies The static dependencies of the function call.
  */
  constructor(fn: Function, invoker: Invoker, dependencies: any[]) {
    this.fn = fn;
    this.invoker = invoker;
    this.dependencies = dependencies;
  }

  /**
  * Invokes the function.
  * @param container The calling container.
  * @param dynamicDependencies Additional dependencies to use during invocation.
  * @return The result of the function invocation.
  */
  invoke(container: Container, dynamicDependencies?: any[]): any {
    return dynamicDependencies !== undefined
      ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies)
      : this.invoker.invoke(container, this.fn, this.dependencies);
  }
}

/**
* Used to configure a Container instance.
*/
interface ContainerConfiguration {
  /**
  * An optional callback which will be called when any function needs an InvocationHandler created (called once per Function).
  */
  onHandlerCreated?: (handler: InvocationHandler) => InvocationHandler;
}

function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
  let i = staticDependencies.length;
  let args = new Array(i);

  while (i--) {
    args[i] = container.get(staticDependencies[i]);
  }

  if (dynamicDependencies !== undefined) {
    args = args.concat(dynamicDependencies);
  }

  return Reflect.construct(fn, args);
}

let classInvokers = {
  [0]: {
    invoke(container, Type) {
      return new Type();
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [1]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [2]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [3]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [4]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [5]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]), container.get(deps[4]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  fallback: {
    invoke: invokeWithDynamicDependencies,
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }
};

/**
* A lightweight, extensible dependency injection container.
*/
export class Container {
  /**
  * The global root Container instance. Available if makeGlobal() has been called. Aurelia Framework calls makeGlobal().
  */
  static instance: Container;

  /**
  * The parent container in the DI hierarchy.
  */
  parent: Container;

  /**
  * The root container in the DI hierarchy.
  */
  root: Container;

  /**
  * Creates an instance of Container.
  * @param configuration Provides some configuration for the new Container instance.
  */
  constructor(configuration?: ContainerConfiguration) {
    if (!configuration) {
      configuration = {};
    }

    this._configuration = configuration;
    this._onHandlerCreated = configuration.onHandlerCreated;
    this._handlers = configuration.handlers || (configuration.handlers = new Map());
    this._resolvers = new Map();
    this.root = this;
    this.parent = null;
  }

  /**
  * Makes this container instance globally reachable through Container.instance.
  */
  makeGlobal(): Container {
    Container.instance = this;
    return this;
  }

  /**
  * Sets an invocation handler creation callback that will be called when new InvocationsHandlers are created (called once per Function).
  * @param onHandlerCreated The callback to be called when an InvocationsHandler is created.
  */
  setHandlerCreatedCallback(onHandlerCreated: (handler: InvocationHandler) => InvocationHandler) {
    this._onHandlerCreated = onHandlerCreated;
    this._configuration.onHandlerCreated = onHandlerCreated;
  }

  /**
  * Registers an existing object instance with the container.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param instance The instance that will be resolved when the key is matched.
  */
  registerInstance(key: any, instance?: any): void {
    this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
  }

  /**
  * Registers a type (constructor function) such that the container always returns the same instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerSingleton(key: any, fn?: Function): void {
    this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
  }

  /**
  * Registers a type (constructor function) such that the container returns a new instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerTransient(key: any, fn?: Function): void {
    this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param handler The resolution function to use when the dependency is needed.
  */
  registerHandler(key: any, handler: (container?: Container, key?: any, resolver?: Resolver) => any): void {
    this.registerResolver(key, new StrategyResolver(3, handler));
  }

  /**
  * Registers an additional key that serves as an alias to the original DI key.
  * @param originalKey The key that originally identified the dependency; usually a constructor function.
  * @param aliasKey An alternate key which can also be used to resolve the same dependency  as the original.
  */
  registerAlias(originalKey: any, aliasKey: any): void {
    this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param resolver The resolver to use when the dependency is needed.
  */
  registerResolver(key: any, resolver: Resolver): void {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    let allResolvers = this._resolvers;
    let result = allResolvers.get(key);

    if (result === undefined) {
      allResolvers.set(key, resolver);
    } else if (result.strategy === 4) {
      result.state.push(resolver);
    } else {
      allResolvers.set(key, new StrategyResolver(4, [result, resolver]));
    }
  }

  /**
  * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
  * @param fn The constructor function to use when the dependency needs to be instantiated.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  */
  autoRegister(fn: any, key?: any): Resolver {
    let resolver;

    if (typeof fn === 'function') {
      let registration = metadata.get(metadata.registration, fn);

      if (registration === undefined) {
        resolver = new StrategyResolver(1, fn);
        this.registerResolver(key === undefined ? fn : key, resolver);
      } else {
        resolver = registration.registerResolver(this, key === undefined ? fn : key, fn);
      }
    } else {
      resolver = new StrategyResolver(0, fn);
      this.registerResolver(key === undefined ? fn : key, resolver);
    }

    return resolver;
  }

  /**
  * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
  * @param fns The constructor function to use when the dependency needs to be instantiated.
  */
  autoRegisterAll(fns: any[]): void {
    let i = fns.length;
    while (i--) {
      this.autoRegister(fns[i]);
    }
  }

  /**
  * Unregisters based on key.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  */
  unregister(key: any) : void {
    this._resolvers.delete(key);
  }

  /**
  * Inspects the container to determine if a particular key has been registred.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param checkParent Indicates whether or not to check the parent container hierarchy.
  * @return Returns true if the key has been registred; false otherwise.
  */
  hasResolver(key: any, checkParent?: boolean = false): boolean {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    return this._resolvers.has(key) || (checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent));
  }

  /**
  * Resolves a single instance based on the provided key.
  * @param key The key that identifies the object to resolve.
  * @return Returns the resolved instance.
  */
  get(key: any): any {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    if (key === Container) {
      return this;
    }

    if (resolverDecorates(key)) {
      return key.get(this, key);
    }

    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.autoRegister(key).get(this, key);
      }

      return this.parent._get(key);
    }

    return resolver.get(this, key);
  }

  _get(key) {
    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.autoRegister(key).get(this, key);
      }

      return this.parent._get(key);
    }

    return resolver.get(this, key);
  }

  /**
  * Resolves all instance registered under the provided key.
  * @param key The key that identifies the objects to resolve.
  * @return Returns an array of the resolved instances.
  */
  getAll(key: any): any[] {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return _emptyParameters;
      }

      return this.parent.getAll(key);
    }

    if (resolver.strategy === 4) {
      let state = resolver.state;
      let i = state.length;
      let results = new Array(i);

      while (i--) {
        results[i] = state[i].get(this, key);
      }

      return results;
    }

    return resolver.get(this, key);
  }

  /**
  * Creates a new dependency injection container whose parent is the current container.
  * @return Returns a new container instance parented to this.
  */
  createChild(): Container {
    let child = new Container(this._configuration);
    child.root = this.root;
    child.parent = this;
    return child;
  }

  /**
  * Invokes a function, recursively resolving its dependencies.
  * @param fn The function to invoke with the auto-resolved dependencies.
  * @param dynamicDependencies Additional function dependencies to use during invocation.
  * @return Returns the instance resulting from calling the function.
  */
  invoke(fn: Function, dynamicDependencies?: any[]) {
    try {
      let handler = this._handlers.get(fn);

      if (handler === undefined) {
        handler = this._createInvocationHandler(fn);
        this._handlers.set(fn, handler);
      }

      return handler.invoke(this, dynamicDependencies);
    } catch (e) {
      throw new AggregateError(`Error invoking ${fn.name}. Check the inner error for details.`, e, true);
    }
  }

  _createInvocationHandler(fn: Function): InvocationHandler {
    let dependencies;

    if (typeof fn.inject === 'function') {
      dependencies = fn.inject();
    } else if (fn.inject === undefined) {
      dependencies = metadata.getOwn(metadata.paramTypes, fn) || _emptyParameters;
    } else {
      dependencies = fn.inject;
    }

    let invoker = metadata.getOwn(metadata.invoker, fn)
      || classInvokers[dependencies.length] || classInvokers.fallback;

    let handler = new InvocationHandler(fn, invoker, dependencies);
    return this._onHandlerCreated !== undefined ? this._onHandlerCreated(handler) : handler;
  }
}

/**
* Decorator: Directs the TypeScript transpiler to write-out type metadata for the decorated class.
*/
export function autoinject(potentialTarget?: any): any {
  let deco = function(target) {
    target.inject = metadata.getOwn(metadata.paramTypes, target) || _emptyParameters;
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decoratored class/function.
*/
export function inject(...rest: any[]): any {
  return function(target, key, descriptor) {
    // if it's true then we injecting rest into function and not Class constructor
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}
