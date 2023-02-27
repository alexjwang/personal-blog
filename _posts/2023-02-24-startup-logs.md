---
layout: post
title: "startup logs 16"
date: 2023-02-24
categories:
---
# logs

This week, we should be able to finish all the core functionality of the new version of Orchard. We will start moving into adding polish as well as develop our growth playbook.

## Day 308: Monday, February 20, 2023

Things are finally coming together. I finally got to see some of John's demo regarding pulling information from uploaded resources. A lot of the core frontend components are built/integrated as well.

The things everyone is working on:

* Kevin is adding polish everywhere within the app. Super important, especially with all the new components we just cobbled together.
* Tae is building out some final key components.
* John is fixing up everything related to resources/utilizing them within Orchard's AI.
* I'm focused on growth stuff and all the associated infra (pricing, onboarding, feedback loops, email, auth, etc.). It's rather tricky to finish these dev tasks before all the key features are put in, so I've been choosing dev tasks carefully (don't want to have to redo a bunch of things after a key feature is added/changed). 

## Day 309: Tuesday, February 21, 2023

At the start of every week, I feel like we're basically ready to launch, but after a day of work, I realize just how much dev work we have left to do. That's not to mention the massive amount of growth/marketing work we also have to do ahead of the launch.

Today, I mostly worked on our email/auth flow for new users. Building in these sorts of loops will be rather important for our long term success, as we want to maximize the number of new users our current users are able to bring in at any time.

Afterward, I ran into this super annoying bug with setting up our Python dev server for local testing—it essentially took me the entire day to fix, which derailed my productivity. 

## Day 310: Wednesday, February 22, 2023

I was about to start working on polishing up our app when I realized that we still need to build out our pricing infra. But before we build out our pricing infra, I need to figure out what our pricing plan actually will be. This is hard because of a number of factors:

1. Our compute costs from running our AI is actually quite high, much higher than a typical SaaS business. There is definitely a bet here that AI models will become cheaper to run over time—I have a suspicion that if we waited until AI models were cost-effective to run, it will be too late as other startups will have launched.
2. We have a lot of competitors launching all around that are pricing rather low. Our compute costs are almost certainly higher than theirs, but I'm also sure that they're taking losses on their power users. I'm fairly certain that the reason why their pricing is so low is to ensure their users don't go off platform in search of AI features.
3. Right now, we have a product with a ton of features, but honestly not a ton of focus on who our exact ideal user/use case is. I think this'll be a priority for me to figure out over the next couple of days while sorting through our pricing model and go to market strategy.

## Day 311: Thursday, February 23, 2023

We have a demo for our mentor tomorrow, which is a bit of a self-imposed deadline to force progress along our end. I've been working through determining our pricing model, but I'm going to put that on hold for the latter half of the day in order to focus on creating a good demo of our capabilities for tomorrow. I dogfood our product a lot, so I'm probably going to just emulate a bunch of different types of users and see if I can break Orchard at various points. 

## Day 312: Friday, February 24, 2023

We had our demo this morning—Tae and John pulled an all-nighter to finish up all the polish we needed for the demo. They were surprisingly functional during the day today, although they did crash later in the evening. The demo itself worked pretty well, but I think most of our questions at the moment revolve less around product itself and more so along the lines of who our ideal customer is. 