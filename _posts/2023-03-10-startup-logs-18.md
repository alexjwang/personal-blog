---
layout: post
title: "startup logs 18"
date: 2023-03-10
categories:
---
# logs

We're planning to launch a sneak peek of our product this week.

## Day 322: Monday, March 6, 2023

Our self-imposed deadline for tweeting a technical teaser is tomorrow. This is a bit of a forcing function for ourselves—we've been delaying launch week after week, and the thought behind this is to get at least something out there to plant the flag, so to speak. I was pretty sick all of last week and really sick this weekend, but sometimes you just gotta pull yourself together to finish your commitments.

As for work for the demo, there are just a bunch of general polish things that needed to be done. The underlying LLM agent is functional and can search/use any uploaded resources, but there's still a bunch of work to be done to the UI to make it look good—using the LLM agent in tandem with Orchard's frontend is not completely bug free yet. Tae, John, and I are going to prioritize all dev tasks related to getting the demo working.

I'm also going to work on planning the demo, writing the copy for our various social media posts, and generally thinking about messaging so that we're ready to go once the product is functional.

## Day 323: Tuesday, March 7, 2023

We launched today at around 6pm PST, which was a lot later than we initially anticipated. I was pretty exhausted today—apart from being sick, I ended up sleeping at 3:30am and waking up at 7am to try to crank out enough work for the launch. Being overly caffeinated while simultaneously being deathly fatigued is always a super weird feeling—a part of me wants to jump out of my chair while my brain is struggling to think more than a few steps ahead.

The reason why it was delayed so much was that getting the demo to do the desired behavior took quite a bit of finagling. There were also quite a few UI bugs in displaying sources/citations that also took a while—only when things were finally functional could I start actually testing the demo. It wasn't really possible to plan the demo before everything was completed because even we aren't really sure what it's fully capable of/what looks good until we start playing around with it ourselves. Since it was already so late in the day, I just recorded the first demo that seemed interesting/high quality and posted it.

To be honest, I felt pretty anxious when we launched, but I felt significantly more relieved once we got some traction coming in. It wasn't anything as big as our previous launch, but that was because we didn't ask people to share our post. If we put in more effort for our next launch, then we should get significantly more traction. 

## Day 324: Wednesday, March 8, 2023

The teaser release went well—we got quite a lot of visibility considering that we didn't ask anyone explicitly to share it. 

We're currently all hands on deck trying to get our product ready to ship to our users.  There are a number of complications, mostly that we need to get approval from Google in order to build out our Drive integration. This process might take us a while—it sucks if we have to delay our launch not because of work on our end, but because we have to wait for this process.

## Day 325: Thursday, March 9, 2023

There are a number of loose ends that we have to finish up for launch that aren't necessarily related to dev work. I'm trying to make sure everything is ready to go once we're approaching launch, but it's quite hard to balance that while also completing core dev tasks.

I've been taking lead on a lot of these random small tasks, but the consequence of this is that I feel like I've been falling behind on core software development work, particularly along the AI front. To remedy that, I'm going to work on incorporating web search into our LLM agent—this should help me brush up on recent changes to our codebase as well as give me an opportunity to delve into the realm of academic research to see what we can add to our AI.

## Day 326: Friday, March 10, 2023

Today, I continued working on integrating web search into our product. I looked at a number of options, including Google, Bing, DuckDuckGo, and Wikipedia. There were a number of issues for most options, and eventually I settled on Bing—it works for our purposes, but the main issue is that it's relatively expensive to run (they're raising their prices by like 9x very soon). Capitalism I guess.