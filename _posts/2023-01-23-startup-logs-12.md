---
layout: post
title: "startup logs 12"
date: 2023-01-23
categories:
---
# logs

This week, we're focusing heavily on user feedback as well as starting development on the next version of Orchard.

## Day 274: Monday, January 16, 2023

We've been getting a lot of inbound regarding job applications which is pretty interesting given that we haven't done anything related to hiring. For now, we're pretty focused on building our next version of Orchard—onboarding new hires would take a bandwidth during a time when we just want to be pushing out code as quickly as possible.

Today, I took another look at our growth numbers and was initially a bit concerned, but then I realized that people might not be using our product as much during the weekends. I'm confident that our daily active user (DAU) count will bounce back during the week. I also recently set up user feedback calls on our Discord channel and I had a great conversation with our first user today. They provided some really valuable feedback that will help us improve our product - nothing revolutionary, but all useful nonetheless.

## Day 275: Tuesday, January 17, 2023

Today was just a lot of dev work. We've finalized our initial designs for the next iteration of Orchard, and now we're just figuring out how best to divvy up the coding tickets. In parallel, I'm also working on fixing a number of random bugs that are relatively minor but actually require an absurd amount of code to fix—it's worth thinking about whether this is a good use of time at the moment, but they need to be completed nonetheless.

## Day 276: Wednesday, January 18, 2023

Nothing specific to update here—just a product development kind of day. I'm still working on a number of features that users have specifically requested (folders, PDF export, etc.), but we're transitioning to building out the next version of Orchard.

## Day 277: Thursday, January 19, 2023

Today was a slower day for Orchard. I'm still conducting user feedback interviews—there's always one or two surprising findings from these interviews, which is quite nice. We've also begun to build out the features related to synthesis of links and information into content generation. The motivation behind this stems from the fact that AI content generation often runs into a problem of not incorporating relevant/personalized information. This is our attempt at solving it beyond good prompt engineering/ability to iterate on outputs (which our current version of Orchard accomplishes). 

I've been spending several hours a day studying our users' behaviors/thinking about how to best utilize our received feedback—one interesting overlap here is that a lot of students have been utilizing Orchard as a second brain (e.g. input lecture notes into the doc and ask questions on it). They claim that it's better than searching Google for answers as it's more akin to asking questions live during lecture (but outside of lecture, you obviously no longer have access to your professor). The features that we're currently spending the vast majority of our engineering efforts on should target this specifically. Another interesting overlap is the fact that many of our users (both students + enterprise) have been pasting links into the chat box and asking questions on it. This is a feature that we can hopefully push out within the next week or so. It's nice to validate features you're building through direct user behavior.

On a side note, I've been quite enjoying the type of work that growth engineering for a consumer product entails. The types of problems are definitely nontechnical in nature, and learning how solve problems unlike anything I've studied previously in school has been super intellectually stimulating. There's also an aspect of data analytics to it, which is fun in a way that reminds me of quant trading.

## Day 278: Friday, January 20, 2023

The focus today is still on product development—the biggest feature that should be ready to launch after the weekend is folders. The reason why folders have been a little slower to ship is that whatever design we pick for folder organization will heavily impact our information synthesis feature set later down the line.

In parallel to product development, I've also been trying to think about growth/go-to-market stuff so that we're ready to go once we're finished with building out all our features. However, this has proven pretty tricky because there aren't really definitively correct answers, and it's hard to verify things without running experiments (impossible while we're still building product). I'm going to lower the priority for this for now until we've built out more key features.