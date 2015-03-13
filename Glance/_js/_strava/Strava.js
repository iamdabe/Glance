function Strava() {
    this.initialize();
}

Animal.prototype.speak = function () {
    result = (this.name + " says: " + this.sound + "!");
}

var cat = new Animal('Kitty', 'Meow');
cat.speak();