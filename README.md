## Node.js Twitter Tools

I manage [the Twitter account](http://twitter.com/Anthrocon) for [Anthrocon](http://www.anthrocon.org/).
Recently, we hit 10,000 followers and I wanted to start following our followers back, but was annoyed 
because none of the tools out there would do exactly what I wanted.  (At least not without paying $29.95/month)

So I wrote my own.


### Installation

    git@github.com:dmuth/nodejs-twitter-tools.git
    cd nodejs-twitter-tools
    npm install


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
    --cursor <cursor>    Our cursor from a previous run so we can pick up where we left off
    --whoami             Ask Twitter who the authenticating user is
    --go                 Actually add followers as twitter friends. (adding users is faked, otherwise)
````

### Sample output

````
$ ./app.js --num 1
2014-01-06T02:53:03.772Z - info: Users left to skip: 0
2014-01-06T02:53:03.775Z - info: Twitter query options: {"count":100}
2014-01-06T02:53:04.474Z - info: Number of queries left in quota: 7
2014-01-06T02:53:12.529Z - info: Skipping protected user: Shortys_Pub
2014-01-06T02:53:12.530Z - info: Skipping protected user: FirecatcherLP
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: GalenChris
2014-01-06T02:53:12.530Z - info: Skipping protected user: Agriwulf
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: ManageFlitter
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: wuufcoyote
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: PopBarware
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: PomHasWifi
2014-01-06T02:53:12.530Z - info: Skipping protected user: lightsguydave
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: IndyFurCon
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: fraytehhusky
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: BayleafxButtons
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: VincentTheGuy
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: USAirways
2014-01-06T02:53:12.530Z - info: Skipping protected user: randomzen
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: Riismo
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: Tihusky
2014-01-06T02:53:12.530Z - info: Skipping protected user: Bolo_Cutefox
2014-01-06T02:53:12.530Z - info: Skipping protected user: Riffuchs
2014-01-06T02:53:12.530Z - info: Skipping user who we're already following: deliverability
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: Wally_Wabbit
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: tgeller
2014-01-06T02:53:12.531Z - info: Skipping protected user: DatTaruCatThing
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: bioswoof
2014-01-06T02:53:12.531Z - info: Skipping protected user: DevinDParlett
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: Raishi_Fox
2014-01-06T02:53:12.531Z - info: Skipping protected user: CJ_theHusky
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: GumballCrash
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: TheVectorCat
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: RoboCop
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: Laphin
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: xLittleLionessx
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: ClydeCheetah
2014-01-06T02:53:12.531Z - info: Skipping protected user: LunariLivi
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: TheFuckingCat
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: EenyuWolf
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: ReiMeerkat
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: Akida__
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: kasifrost
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: Popufurman
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: lablayers
2014-01-06T02:53:12.531Z - info: Skipping protected user: Coolraptors
2014-01-06T02:53:12.531Z - info: Skipping protected user: RazokHuskie
2014-01-06T02:53:12.531Z - info: Skipping protected user: Bedroom_Folfie
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: cyancrux
2014-01-06T02:53:12.531Z - info: Skipping user who we're already following: Inazuma_Okami
2014-01-06T02:53:12.532Z - info: Following user 'LearningLaravel'...
2014-01-06T02:53:13.887Z - info: Done adding users!
````

Note that by default protected users are ignored, as are users we are already following.


### /followers/list only returns 200 users max instead of 5,000.  Halp!

No worries.  It turns out that cursors are persistent for a macroscopic 
amount of time.  Just keep running the script, and after you exhaust 
your quota, look for a line near the end of the run that looks like this:

````
2014-01-06T04:12:24.453Z - info: NOTE: Want to pick up here again? This is the current cursor: 1451741634324255500
````

After your quota has replenished, be sure to specify this cursor with 
--cursor on the command line, and your follower queries will pick up 
where they left off.


### For Further Reading
- [Twitter REST API v1.1 Resources](https://dev.twitter.com/docs/api/1.1)


### Feedback

Have feedback?  Want to report bugs?

You can find me on various social networks here:

[http://www.dmuth.org/contact](http://www.dmuth.org/contact)

Enjoy!



