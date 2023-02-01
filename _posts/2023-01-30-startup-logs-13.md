---
layout: post
title: "startup logs 13"
date: 2023-01-30
categories:
---
# logs

This week, we're working on hopefully finishing up the rest of the key features for Orchard 2.0—adding links should be done soon, but figuring out how to synthesize all the information in your docs should take a while longer.

## Day 281: Monday, January 23, 2023

Today, we launched folders. This has been a feature that I've personally wanted for quite some time, especially since I have a ton of documents living in Orchard now at this point. At the very least, it'll make things easier to dog food for ourselves now that it's easier to find old documents that we've written. 

I had a super weird bug that was preventing me from merging my PR—nuking my yarn.lock file/the usual fixes didn't seem to fix anything. Ultimately, I just copied over Kevin's yarn.lock, and it worked magically. No clue what was happening. That's coding I guess. UPDATE: figured out that the posthog-js library for some reason pushed a random outdated sentry dependency without changing its package version number. Kevin's old yarn.lock file didn't have this updated dependency (which is outdated), whereas when I build my yarn.lock file, there's no way to revert to the old working posthog-js library (as the version number is still the same).

Next up on my list of TODOs is taking a look at invite emails (when you share a doc with someone). This is going to be super gnarly—while we have some basic authentication functionality in place, the scoping for each individual document is going to require a complete overhaul of a lot of code. There's some interesting growth considerations here, which is why I believe it's a higher priority task.

## Day 281: Tuesday, January 24, 2023

Today, I did a deep dive into email options. Previously, I'd been using Mailgun as a custom SMTP provider in an attempt to fix our issue of signup emails going to spam (Supabase is good for auth, but their email flow is terrible). Things are working now, so I'm a little hesitant to mess with it given that I don't know how finicky these things are (for some reason, Gmail is super sensitive to spam emails, and with the amount of emails we're sending out, our emails can definitely appear as spam).

I've also been looking into two other startups: [Resend.com](http://Resend.com) and [loops.so](http://loops.so). Both have their pros and cons, but I'm not sure if either of them can compete with Mailgun on pricing. UPDATE: [resend.com](http://resend.com) publicly announced their pricing, which is cheaper than Mailgun. However, they do not have templates, which is a bummer since I don't want to recreate emails from scratch.

## Day 282: Wednesday, January 25, 2023

We left the house today (first time in a while) to work at a café. Today felt pretty productive—I didn't get as much coding work done, but I did do a lot of thinking around growth/user data. I'm not sure how much I should be posting publicly online, but there have been quite a lot of interesting/encouraging findings. I'm going to do some brainstorming on the side to figure out actionable things to do from said data—a lot of our team's development work is not user-driven, but rather our own intuition/design. It's worked thus far, but I think it would be nice to have a lot more user-driven development—there's a balance here, innovator's dilemma yada yada.

## Day 283: Thursday, January 26, 2023

We've been super parallelized lately, so today we had a long meeting to regroup and figure out what the status was on all of our different threads. Some of the tasks we have left are actually blocking each other, so during this meeting, we also determined what tasks to prioritize (in order to unblock individuals and resume our previous parallelized working state). Our hope is to finish most of our key features sometime this week, and then spend the next week iterating/polishing up our product. There's also a ton of planning for launch that needs to get done—honestly, I'm not sure how products are becoming so popular without seemingly having found PMF. There's a large gap in marketing /distribution ability that I need to catch up on.

## Day 284: Friday, January 27, 2023

I'm working on a different segment of code from everyone else—the others are working on a lot of the changes to the chat/LLM context window in order to ingest links/outside sources. I'm still tackling a lot of auth infrastructure that we need to build to correctly enable sharing—everything should technically work, but some reason sending emails is super spotty (Mailgun straight up drops half our emails).

Weekend update: we decided to take a spontaneous trip to SF on Saturday. In the middle of our ride there, our site just went down but none of us had our computers—guess this means that we can't just collectively take a group trip anymore, especially after we have a bigger launch.