---
layout: post
title: "startup logs 17"
date: 2023-03-03
categories:
---
# logs

We have postponed launch to figure out our messaging/enterprise plans. The new launch date is slated for sometime next week.

## Day 315: Monday, February 27, 2023

There's still a high degree of polish left to finish up on Orchard before it's ready for release to the general public. We're also planning to approach one of our enterprise customers with a special enterprise deal—if we're able to work this out with them, then it would help solve a lot of our pricing concerns.

## Day 316: Tuesday, February 28, 2023

We weren't able to launch in February like we originally planned, which feels kinda bad. We have just been adding features over and over again, most of which is essential—this is tricky because we want to have a polished product before adding fuel to the growth machine. Breakdown of tasks loosely by person:

* John is prompt engineering.
* Kevin is polishing everything.
* Tae is working on new product releases.
* I'm building infra for pricing, growth, and bug fixes for our users.

## Day 317: Wednesday, March 1, 2023

March kicked off with a huge day for the Village. OpenAI released their ChatGPT API, but perhaps the biggest thing of all was the fact that it's 10x cheaper than OpenAI's previous offerings. This should improve the quality of our product significantly, which brings us closer to launch.

## Day 318: Thursday, March 2, 2023

Unfortunately, we did not manage to get our product ready for the technical demo launch we had planned for tomorrow. If we pulled an all-nighter, it might've been somewhat possible, but the team was pretty exhausted as a whole. I hate having to continually delay our launch, but I understand that launching without an impressive product is similarly bad. At the end of the day, if we have an impressive product to showcase/launch, then everything else should be a secondary concern.

That said, we did manage to make a lot of progress today. We did a complete code refactor, which should make our future development experience much cleaner. I updated Orchard 1.0 in production to use the ChatGPT API rather than davinci, which should bring down our costs considerably (10x). In general, we pushed out a lot of changes to Orchard 2.0 which should help make it become significantly more ergonomic. We're still not quite where we'd want to be however—it's a little concerning to me because I have heard the mantra that you should launch your product while it's still a little rough around the edges and then polish it up, rather than waiting until it's perfect (at which point it may be too late).

The generative AI space is moving so quickly, which I guess is a good thing, but also a really scary thing. I would hate to live with regret knowing that we were in the midst of this huge paradigm shift, but failed to capitalize on it. 

## Day 319: Friday, March 3, 2023

I've been sick this past week, and I'm feeling a lot worse today. It also seems like John is coming down with something, which is a terrible time for us all to get sick. We're generally implementing a lot of changes to our product as we're pulling chat to the forefront of our application, and making it more akin to a search interface. Part of this includes switching over to using the ChatGPT API, which actually requires quite a bit of dev work.