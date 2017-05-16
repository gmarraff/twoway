# __TWOWAY__

## A raw but simple library that provide two way data binding for small applications.
------------



TwoWay is a jQuery library the provides basilar twoway data bindings and object creation by DOM definition, particulary it allows this features:
- Display data from rest api in a simple way
- Mantain updated DOM input variations with the related hash/object and other DOM elements
- Create objects from DOM elements
- Add fields to the object from DOM elements
- Say "DOM elements" many times

----------------------------------------------

## **Purpose**
The puropose of this lib is obviously not to subvert the Javascript development world.<br>
If you want to build an application without putting to much energy in the frontend development without compromising features, i think TwoWay will help you doing things fast.

----------------------------------------------

## **Requirements**
TwoWay use jQuery as standard javascript library, so you need to include it before use TwoWay.
```html
<script type="text/javascript" src="awsomejQueryCDN.js" />
<script type="text/javascript" src="twoway.js" />
```

---------------

## **How to use**
There are two principal use case for this library:

- Handle DOM element with existing objects
- Create objects from DOM element

### Handle existing objects
Suppose you have downloaded from a REST API this JSON parsed hash that define a father and the name of his children.
```javascript
{
  father: {
    name: 'Foo',
    surname: 'Bar',
    age: 50,
    children: [
        {name: 'FooJr'},
        {name: 'BarJr'}
      ]
    }
}         
```
The classic jQuery approach to display data in the DOM would be this:
```javascript
var father = MagnificentApiCall();
$('#father_name').val(father['father']['name']);
...
```
OR
```javascript
var father = MagnificentApiCall();
$.each(father, function(key, value){
  //Some killer code
});
```

With TwoWay you just have to build the rigth HTML lines:
```html
<input type="text" data-twoway_label="father|name">
<input type="text" data-twoway_label="father|surname">
<input type="number" data-twoway_label="father|age">
<input type="text" data-twoway_label="father|children|0|name">
<input type="text" data-twoway_label="father|children|1|name">
<input type="radio" data-twoway_label="father|hair" value="black">
<input type="radio" data-twoway_label="father|hair" value="blonde">
```

And handle them with TwoWay!
```javascript
var father = MagnificentApiCall();
var father_tw = new TwoWay(father);
$('[data-twoway_label*="father|"]').change(function(){
    father_tw.bind(this);
}
});
father_tw.initializeFields();
```

### Create objects from DOM
Now suppose we have to make a page the allow the user to insert a new father.
Now, we can write the hash manually and create the TwoWay object with it, but what if the father model had a lot more fields?<br>
We will spend half time of application development writing empty hash.
With TwoWay you can define the DOM elements and build the hash from the root field of your needed object.
```javascript
var new_father = new TwoWay();
new_father.build("father");
```
If the DOM elements had a default value in them, you can copy them in the object by passing as second value this option object.
```javascript
new_father.build("father", {bind: true});
```

But wait, my father can conceive more than two children, this library is like the Chinese Government!<br>
And insteeeead...
You can reuse the build method in a mirate way after creating a new dom element!
```javascript
$('#family_nucleus').append('<input type="text" data-twoway_label="father|children|2|name"');
new_father.build('father|children|2|');
```
### **Remove fields**
If you need to remove a particular portion of object, you can use the "remove" methods that will delete the object from the DOM either from the TwoWay object.
```javascript
new_father.remove('father|children|2');
```

If you don't want to remove the object from the DOM you can call the "softRemove" method that will delete only the field from the hash.
```javascript
new_father.softRemove('father|children|2');
```
##### **Be careful!**<br>
If you use softRemove and then call
```javascript
new_father.build('father');
```
The second children will be rebuilded in the object!

### Lazyness
If you don't want to manually manage the insertion/deletion of new data, you can rebuild your hash from zero before send the object to the backend server, though this will break the concept of two way data binding.

```javascript
new_father.build('father', {bind: true, from_zero: true});
```

### Reitrive the object
When you need to use the hash stored in the TwoWay object you can get it with the method:
```javascript
new_fater.getHash();
```

### Set a new hash
If you need to change the hash stored in the TwoWay object you can do it by calling:
```javascript
new_father.setHash({/*attributes*/});
```
-----
## **Summary**
There's a summary of the public methods you can use.

------

## **Conclusion**
Feel free to improve the development of this library by forking it or make pull requests!
