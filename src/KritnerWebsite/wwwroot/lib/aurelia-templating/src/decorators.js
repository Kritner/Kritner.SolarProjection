import 'core-js';
import {metadata} from 'aurelia-metadata';
import {BindableProperty} from './bindable-property';
import {ElementConfigResource} from './element-config';
import {ViewLocator, RelativeViewStrategy, NoViewStrategy, InlineViewStrategy} from './view-strategy';
import {HtmlBehaviorResource} from './html-behavior';

function validateBehaviorName(name, type) {
  if (/[A-Z]/.test(name)) {
    throw new Error(`'${name}' is not a valid ${type} name.  Upper-case letters are not allowed because the DOM is not case-sensitive.`);
  }
}

/**
* Decorator: Specifies a resource instance that describes the decorated class.
* @param instance The resource instance.
*/
export function resource(instance: Object): any {
  return function(target) {
    metadata.define(metadata.resource, instance, target);
  };
}

/**
* Decorator: Specifies a custom HtmlBehaviorResource instance or an object that overrides various implementation details of the default HtmlBehaviorResource.
* @param override The customized HtmlBehaviorResource or an object to override the default with.
*/
export function behavior(override: HtmlBehaviorResource | Object): any {
  return function(target) {
    if (override instanceof HtmlBehaviorResource) {
      metadata.define(metadata.resource, override, target);
    } else {
      let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
      Object.assign(r, override);
    }
  };
}

/**
* Decorator: Indicates that the decorated class is a custom element.
* @param name The name of the custom element.
*/
export function customElement(name: string): any {
  validateBehaviorName(name, 'custom element');
  return function(target) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
    r.elementName = name;
  };
}

/**
* Decorator: Indicates that the decorated class is a custom attribute.
* @param name The name of the custom attribute.
* @param defaultBindingMode The default binding mode to use when the attribute is bound wtih .bind.
*/
export function customAttribute(name: string, defaultBindingMode?: number): any {
  validateBehaviorName(name, 'custom attribute');
  return function(target) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, target);
    r.attributeName = name;
    r.attributeDefaultBindingMode = defaultBindingMode;
  };
}

/**
* Decorator: Applied to custom attributes. Indicates that whatever element the
* attribute is placed on should be converted into a template and that this
* attribute controls the instantiation of the template.
*/
export function templateController(target?): any {
  let deco = function(t) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.liftsContent = true;
  };

  return target ? deco(target) : deco;
}

/**
* Decorator: Specifies that a property is bindable through HTML.
* @param nameOrConfigOrTarget The name of the property, or a configuration object.
*/
export function bindable(nameOrConfigOrTarget?: string | Object, key?, descriptor?): any {
  let deco = function(target, key2, descriptor2) {
    let actualTarget = key2 ? target.constructor : target; //is it on a property or a class?
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, actualTarget);
    let prop;

    if (key2) { //is it on a property or a class?
      nameOrConfigOrTarget = nameOrConfigOrTarget || {};
      nameOrConfigOrTarget.name = key2;
    }

    prop = new BindableProperty(nameOrConfigOrTarget);
    return prop.registerWith(actualTarget, r, descriptor2);
  };

  if (!nameOrConfigOrTarget) { //placed on property initializer with parens
    return deco;
  }

  if (key) { //placed on a property initializer without parens
    let target = nameOrConfigOrTarget;
    nameOrConfigOrTarget = null;
    return deco(target, key, descriptor);
  }

  return deco; //placed on a class
}

/**
* Decorator: Specifies that the decorated custom attribute has options that
* are dynamic, based on their presence in HTML and not statically known.
*/
export function dynamicOptions(target?): any {
  let deco = function(t) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.hasDynamicOptions = true;
  };

  return target ? deco(target) : deco;
}

/**
* Decorator: Indicates that the custom element should render its view in Shadow
* DOM. This decorator may change slighly when Aurelia updates to Shadow DOM v1.
*/
export function useShadowDOM(target?): any {
  let deco = function(t) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.targetShadowDOM = true;
  };

  return target ? deco(target) : deco;
}

function doNotProcessContent() {
  return false;
}

/**
* Decorator: Enables custom processing of the content that is places inside the
* custom element by its consumer.
* @param processor Pass a boolean to direct the template compiler to not process
* the content placed inside this element. Alternatively, pass a function which
* can provide custom processing of the content. This function should then return
* a boolean indicating whether the compiler should also process the content.
*/
export function processContent(processor: boolean | Function): any {
  return function(t) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.processContent = processor || doNotProcessContent;
  };
}

/**
* Decorator: Indicates that the custom element should be rendered without its
* element container.
*/
export function containerless(target?): any {
  let deco = function(t) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, t);
    r.containerless = true;
  };

  return target ? deco(target) : deco;
}

/**
* Decorator: Associates a custom view strategy with the component.
* @param strategy The view strategy instance.
*/
export function useViewStrategy(strategy: Object): any {
  return function(target) {
    metadata.define(ViewLocator.viewStrategyMetadataKey, strategy, target);
  };
}

/**
* Decorator: Provides a relative path to a view for the component.
* @param path The path to the view.
*/
export function useView(path: string): any {
  return useViewStrategy(new RelativeViewStrategy(path));
}

/**
* Decorator: Provides a view template, directly inline, for the component. Be
* sure to wrap the markup in a template element.
* @param markup The markup for the view.
* @param dependencies A list of dependencies that the template has.
* @param dependencyBaseUrl A base url from which the dependencies will be loaded.
*/
export function inlineView(markup:string, dependencies?:Array<string|Function|Object>, dependencyBaseUrl?:string): any {
  return useViewStrategy(new InlineViewStrategy(markup, dependencies, dependencyBaseUrl));
}

/**
* Decorator: Indicates that the component has no view.
*/
export function noView(target?): any {
  let deco = function(t) {
    metadata.define(ViewLocator.viewStrategyMetadataKey, new NoViewStrategy(), t);
  };

  return target ? deco(target) : deco;
}

/**
* Decorator: Indicates that the decorated class provides element configuration
* to the EventManager for one or more Web Components.
*/
export function elementConfig(target?): any {
  let deco = function(t) {
    metadata.define(metadata.resource, new ElementConfigResource(), t);
  };

  return target ? deco(target) : deco;
}
