## Node.js Twitter Tools

I manage the Twitter account for Anthrocon and wanted to start following our 
followers back, but was annoyed because none of the tools out there would do 
exactly what I wanted.  (At least not without paying $29.95/month)

So I wrote my own.


### Configuration

- Create an app at https://dev.twitter.com/
- Copy the file `config/default.yaml` to `config/development.yaml` 
	and populate the values with your keys from twitter.
- Make sure that your app's "access level" is set to "Read and Write".  
	**This is not the default!**


### Running

````
  Usage: app.js [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -n, --num <n>        How many followers to add as friends
    --include_protected  Add protected users as friends (request access to their Twitter feeds, actually)
    --whoami             Ask Twitter who the authenticating user is
    --go                 Actually add followers as twitter friends. (adding users is faked, otherwise)
````
