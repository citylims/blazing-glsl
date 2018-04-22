// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by glitchy.js.
import { name as packageName } from "meteor/pigeonworks:glitchy";

// Write your tests here!
// Here is an example.
Tinytest.add('glitchy - example', function (test) {
  test.equal(packageName, "glitchy");
});
