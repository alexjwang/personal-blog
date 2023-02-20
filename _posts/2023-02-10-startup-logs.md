---
layout: post
title: "startup logs 15"
date: 2023-02-10
categories:
---
# logs

The goal for this week is to actually finish up most of the core software development work.

## Day 294: Monday, February 6, 2023

Today was an interesting day for us, as I found on Twitter the launch of a new AI product called Embra that's very similar to what we were envisioning for Orchard (<https://twitter.com/zachtratar/status/1623015294569713665?s=20>). It captures the same ideas that we have about search/synthesis of information as you're able to input context from whatever you're working on directly into your ChatGPT-like interface. They have an interesting layer of abstraction as they're simply a chat interface (without our text editor interface), which probably explains why they were able to ship so quickly(creating a fully-featured text editor was actually a ton of dev time). 

This influenced our immediate developer roadmap, as now we're planning to build out a native Mac app that should be able to integrate with Chrome/other platforms to immediately pull context from wherever the resources natively live—this should help with onboarding new people, as they don't have to manually upload a ton of their own resources all the time.

There is an interesting distinction here between more ephemeral resources (e.g. in Embra, it only acts on tabs that are already open) versus stored resources (which we have) that you can embed/search over. I would be surprised if Embra/similar products don't move towards stored resources—I guess our only answer is that we have to move faster/beat them to market.

## Day 295: Tuesday, February 7, 2023

Nothing too interesting happened today—we have a lot of new coding tickets related to our native Mac app/new feature set that we have to get done. Hitting our original product timeline is started to look more and more unlikely, but I'm starting to enjoy how our product is shaping up.

Some interesting things is that our number of new users is actually picking up every single day. We also got featured by a16z today in this article: <https://a16z.com/2023/02/07/everyday-ai-consumer/>.

## Day 296: Wednesday, February 8, 2023

I'm starting to think more about marketing—we had a call today with somebody who could potentially help us out. Adding someone to the team specifically to do this will be a big decision (this'll be the first time there's more than just the four of us), but it's something that we're definitely considering.

I also set up a call with the manager of a TikToker to see if we can get some viral growth/marketing that way— it would be really cool to see our product get some organic traction as more conventional ads don't seem to do the trick on users anymore. 

## Day 297: Thursday, February 9, 2023

I spent some more time thinking about growth this afternoon, especially given that I had a call with the TikTok manager in the afternoon. That was a pretty educational call, but I was genuinely surprised by how much they asked for in exchange for a single TikTok video on Orchard. I thought it would be in the realm of like a thousand dollars, but he quoted me 30k which is rather ridiculous. At this point, I think product-led growth/word-of-mouth is much better than paid advertisement.

## Day 298: Friday, February 10, 2023

I was traveling to Hawaii for most of the day, but I did some investigation into what our native Mac app would entail. It appears that the only way for our native app to communicate with Chrome/other applications is to install some sort of extension—this is going to add a ton of complexity/require a lot of engineering time than I initially expected. I'll continue scoping out how much additional effort this will take, but in the interest of moving fast, we should just continue with our original launch plan. 