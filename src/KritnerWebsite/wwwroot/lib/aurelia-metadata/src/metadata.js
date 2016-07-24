import {PLATFORM} from 'aurelia-pal';

const theGlobal = PLATFORM.global;
const emptyMetadata = Object.freeze({});
const metadataContainerKey = '__metadata__';

if (typeof theGlobal.Reflect === 'undefined') {
  theGlobal.Reflect = {};
}

if (typeof theGlobal.Reflect.getOwnMetadata === 'undefined') {
  Reflect.getOwnMetadata = function(metadataKey, target, targetKey) {
    return ((target[metadataContainerKey] || emptyMetadata)[targetKey] || emptyMetadata)[metadataKey];
  };
}

if (typeof theGlobal.Reflect.defineMetadata === 'undefined') {
  Reflect.defineMetadata = function(metadataKey, metadataValue, target, targetKey) {
    let metadataContainer = target.hasOwnProperty(metadataContainerKey) ? target[metadataContainerKey] : (target[metadataContainerKey] = {});
    let targetContainer = metadataContainer[targetKey] || (metadataContainer[targetKey] = {});
    targetContainer[metadataKey] = metadataValue;
  };
}

if (typeof theGlobal.Reflect.metadata === 'undefined') {
  Reflect.metadata = function(metadataKey, metadataValue) {
    return function(target, targetKey) {
      Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
    };
  };
}

/**
* Helpers for working with metadata on functions.
*/
interface MetadataType {
  /**
  * The metadata key representing pluggable resources.
  */
  resource: string;
  /**
  * The metadata key representing parameter type information.
  */
  paramTypes: string;
  /**
  * The metadata key representing property information.
  */
  properties: string;
  /**
  * Gets metadata specified by a key on a target, searching up the inheritance hierarchy.
  * @param metadataKey The key for the metadata to lookup.
  * @param target The target to lookup the metadata on.
  * @param targetKey The member on the target to lookup the metadata on.
  */
  get(metadataKey: string, target: Function, targetKey: string): Object;
  /**
  * Gets metadata specified by a key on a target, only searching the own instance.
  * @param metadataKey The key for the metadata to lookup.
  * @param target The target to lookup the metadata on.
  * @param targetKey The member on the target to lookup the metadata on.
  */
  getOwn(metadataKey: string, target: Function, targetKey: string): Object;
  /**
  * Defines metadata specified by a key on a target.
  * @param metadataKey The key for the metadata to define.
  * @param target The target to set the metadata on.
  * @param targetKey The member on the target to set the metadata on.
  */
  define(metadataKey: string, metadataValue: Object, target: Function, targetKey: string): void;
  /**
  * Gets metadata specified by a key on a target, or creates an instance of the specified metadata if not found.
  * @param metadataKey The key for the metadata to lookup or create.
  * @param Type The type of metadata to create if existing metadata is not found.
  * @param target The target to lookup or create the metadata on.
  * @param targetKey The member on the target to lookup or create the metadata on.
  */
  getOrCreateOwn(metadataKey: string, Type: Function, target: Function, targetKey: string): Object;
}

/**
* Provides helpers for working with metadata.
*/
export const metadata: MetadataType = {
  resource: 'aurelia:resource',
  paramTypes: 'design:paramtypes',
  properties: 'design:properties',
  get(metadataKey: string, target: Function, targetKey: string): Object {
    if (!target) { return undefined; }
    let result = metadata.getOwn(metadataKey, target, targetKey);
    return result === undefined ? metadata.get(metadataKey, Object.getPrototypeOf(target), targetKey) : result;
  },
  getOwn(metadataKey: string, target: Function, targetKey: string): Object {
    if (!target) { return undefined; }
    return Reflect.getOwnMetadata(metadataKey, target, targetKey);
  },
  define(metadataKey: string, metadataValue: Object, target: Function, targetKey: string): void {
    Reflect.defineMetadata(metadataKey, metadataValue, target, targetKey);
  },
  getOrCreateOwn(metadataKey: string, Type: Function, target: Function, targetKey: string): Object {
    let result = metadata.getOwn(metadataKey, target, targetKey);

    if (result === undefined) {
      result = new Type();
      Reflect.defineMetadata(metadataKey, result, target, targetKey);
    }

    return result;
  }
};
