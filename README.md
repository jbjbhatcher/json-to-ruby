# JSON - Ruby Atom Plugin
Converts a JSON String to a boilerplate ruby class definition!

# Instructions
1. Highlight a valid JSON object
2. Select the convert action
3. Paste your shiny, formatted code into a new .rb file 😎

## Examples
This JSON object
```
{
  "howdy": "do, neighborino",
  "howAbootThatWeather": "?"
}
```
will become
```
class SomeClass
	attr_accessor :howdy
	attr_accessor :how_aboot_that_weather
end
```
