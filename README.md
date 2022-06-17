# Melrady

Compares tracks on Spotify using their Audio Analysis data.

Started 8/15/2021

Completed 9/25/2021

Rework Started 6/8/2022

Rework Completed 6/17/2022

# June 8-17th, 2022

This application's always been closed source, but I reckoned I might as well open source it and clean up the code a bit.

## Why release it now?

I was planning to make it open after I had an MVP working, but goofed and committed the secret and client id codes Spotify gave me in a place gitignore wasn't keeping out. My bad. Won't happen again (I wasn't entirely knowledgable on how secret keys worked before.)

I have a chunk of free time since it's summer, and decided to do some spring cleaning.
So, I've made a new repo to prevent any secret key fiascos and placed the code here.

## Code Cleanup

I built this in a bit less than a month, while learning lots of new things about express and interacting with and making APIs, so it's not the code I'm proudest of. This is my opportunity to fix that.

I've set and met a distinct set of goals for myself:

### Make the backend readable, understandable, and modern

This was my first time building a "really real Express backend" so I was going more for function without form back then. I also neglected to realize you could split your routes into different files. Whoops.

So, I learnt more about the framework and how middleware works, and managed to reduce lines of code and points of failure massively by using a single authentication middleware instead of writing unique authentication schemes for each route. Very convenient.

I took much care in splitting off code into their correct modules, reducing algorithm complexity, and writing clearer documentation. I refuse to say that it's all absolutely perfect, but it's the best I can do, as of now.

I was also learning a lot of JavaScript at the time I started this project, so I didn't really grasp Promises as much as I do now. I've rewritten a lot of the async stuff to make more sense and be in line with standard usage.

### Do the exact same thing for the frontend

> It would be weird to clean your kitchen but leave the dining room messy.

---

#### Search Page Changes

The pride and joy of this operation. I made a large effort to refresh the visual design by using Bootstrap's features (and media queries) to utilize horizontal space to keep the design _mobile-first but big screen friendly._

I took particular care in fixing a lot of the HTML semantics issues I had before, as well as making it that much more accessible by replacing the dropdown menus with cards.

The loading and shuffling process for favorites to display as track placeholders has been redone.

> Fun fact: the previous shuffling algorithm used to be based entirely on luck -- shuffling would be attempted twice and if it didn't work either time the towel was thrown.

The code behind was quite messy previously; it was all done in two &lt;script&gt; tags, had a complex system of managing selected tracks, and wasn't designed with sense in mind. I've resolved that, split everything into separate external scripts, and reworked a lot of the systems to keep the same seamless experience while making everything more performant and safe.

Building elements used to be done via instantiating a container element and appending other elements to it and all that jazz, but I've moved to using template literals a lot more instead. It's more concise and easier to implement, from what I've experienced.

Many times I considered removing JQuery, but decided against it, at least for the sake of exposing myself to it more. And it just works. Not the most bleeding-edge thing to use, but it gets the job done at least.

### Stats Page Changes

I kept the stats page largely the same visually, since I saw no glaring issues with its design. I did, however, make a few minor changes that help with usability and visual appeal:

I split the full track data into individual cards instead of lumping it all under a dropdown, and added the cards at the end of the page so the user could quickly check the Legend.

High and Low value cards now display which tracks hold those specific records, so users don't have to go back and forth beteen checking full data and the value cards to find out which holds which.

Absolute scaling has been removed, I didn't really see the vision for it since all it really did was negate the entire purpose of the charts - relative comparison. It also added a ton of unnecessary complexity to how datasets are managed and formed.

_In terms of what the user can't see, though, there's plenty to write home about!_

I've made real use of EJS and split a lot of the elements in the stats page into their own partials. The only partials used to be the header and navbar, but I've split off the legend, high low and average cards, full track data cards, and chart buttons into their own partials. This helps hugely for making the full page concise, and the components are more easily managed now.

Much care has been placed in reworking how the chart is made and filled with data. I've split the major bits into two classes:

- DataManager
- ChartManager

DataManager does some of the heavyish calculations we were doing in the backend in the frontend, particularly for the relative track feature data for the track objects. It also calculates the max, avg, and minimum values used in the high avg and low cards.

It's a necessary precursor to the ChartManager, which takes the "fully-formed" data and makes it into datasets for the chart it creates. My previous usage of ChartJS was particularly egregious, and moving the functions into a class helped bunches for usability and testing.

The Stats page is the most important part of the application, and I made sure not to neglect it. That's why I also made an effort to simplify the HTML structure, shuffling and removing divs to make the page smaller and less of a hassle to edit.

# Moledar -> Melrady

I'll also be renaming the project to Melrady, it's a nicer name in my opinion and it helps to distinguish it from the previous iteration.
