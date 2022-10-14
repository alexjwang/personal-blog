---
layout: post
title: "startup logs"
date: 2022-10-05
categories:
---
## reasoning
We met a dude named Aman Sanger at the Neo Reunion, who is working on a startup in the same space that we have been exploring for the past week. He wrote a [postmortem](https://amansanger.com/posts/enstil.html) on one of his past projects, and I thought his day by day timeline would be cool to emulate. I've been meaning to do this for my personal life (as I've previously blogged about), but having a more professional reason behind it might be the activation energy I've been lacking to finally implement the habit.

I think the easiest/most sustainable form of this habit would be to simply write a sentence or two on what we did, track a KPI, and maybe upload a photo/video. The format of these logs will most likely change over time as I figure out what's optimal. This'll help me avoid having to write massive, multi-week documents on what we've done/where we're heading—plus I believe it'll be super fun/nostalgic to look back at these logs in the future.

## logs

Village Technologies was incorporated on 4/18. I'll consider that Day 1, but the actual Day 1 is up in the air. It could be the first day we started working on Village full-time (July 1). It could be when the four of us won HackMIT with our project, "Villager," or even earlier when we attended our first hackathon as a team at PennApps (Creddit). It could be the first day I met Kevin and John, our first YC application for S21, or even the early days of when I used to go over to Tae's house and work on college apps together. But anyways, the day Village was legally formed sounds a nice origin date.

### Day 170: October 5, 2022

We had a regroup session in the morning today and concluded that it's time to start building. We've been doing a lot of research into what the capabilities of AI are today—we have a better idea now of what people have already done, but the conclusion is that nobody really knows what the near future of AI looks like. We can read, write, and explore AI stuff even more, but there are rapidly diminishing marginal returns here. It's now time to build and see what insights/skills we can derive from the process.

The general feeling is that AI is fascinating from a technical perspective (we're all nerds), and we are excited by the wave of applications that this technology unlocks. For now, we are more than happy to continue working in this space.

We have a couple of questions that we have no answers to at the moment. The first is even though the AI industry is rapidly growing, whether or not a billion dollar company will come out of the AI space in the future. If no company exists, there's nowhere we can position ourselves to capture said company. Another is what exact project we want to build out—for now, we've settled on copilot for Figma. However, I personally believe we should optimize for both technical learnings as well as extensibility/implications of if we do manage to successfully build out an application.

![10-05]({{"/assets/images/10-05-22.jpg" | prepend: site.baseurl }})

*What I stare at for hours every day*

### Day 171: October 6, 2022

We were relatively parallelized today on what we were looking at. Kevin has been digging a lot into serverless GPUs—there seems to be a lot of promise there. John did a lot of reading on RLHF frameworks, specifically focusing on math/terminology. Tae focused on UX + product—the main problem at hand is that a lot of what we can imagine hinges on our model being nearly flawless. I'm also doing a lot of reading, but I've also been focusing on writing memos as a method of extracting insights that'll hopefully push our product towards success. We have also begun to set up calls with UX designers—we figure that it'll be supremely useful to witness Figma experts at work.

![10-06]({{"/assets/images/10-06-22.jpg" | prepend: site.baseurl }})

*Random Figma truck serving ice cream. They were giving out swag, but Ryan took a hat without asking—the girl got mad at us and refused to give Kevin and me any swag :(*

### Day 172: October 7, 2022

We had a longer meeting this morning about what we want to get done. Discussing together what our product will look like, bigger picture/endgame stuff, as well as technical limitations was really useful—I can feel that we're getting better at team discussions, which is great. I set up a lot of calls with UX designers—hopefully they'll provide us valuable data for future use.

![10-07]({{"/assets/images/10-07-22.jpg" | prepend: site.baseurl }})

*Morning standup*

## Day 175: October 10, 2022
We have more or less settled on an idea for now, and our goal for this week is to nail down what we need to build for this product.

Kevin's doing more technical exploration for how to fit an LLM on the cloud. It's necessary for our current project, but there's an important additional benefit in that we can understand the specific difficulties in setting up an LLM for personal use. John is digging into retraining Codex/GPT on Figma files, but there seems to be two big blockers. One is to obviously figure out how to finetune GPT/Codex. The second is how to create a dataset of Figma files.

I've been digging a bit into the engineering behind the Figma API/how a plugin would work—the docs pretty explicitly state that it's impossible to have a long running user action that monitors/responds to changes which is deeply concerning.

![10-10]({{"/assets/images/10-10-22.jpg" | prepend: site.baseurl }})

*We like to buy expensive chairs and sit on the couch instead*

## Day 176: October 11, 2022
We decided to switch up our working environment and journey to the library today this morning. At our daily standup, we had a good discussion about our level of conviction regarding an AI design tool. It might be prudent to learn how to do RLHF in general, so I've been trying to brainstorm ideas for a smaller project where I can implement RLHF without having to procure a Figma dataset (and simultaneously keep it as relevant as possible to our main thread). Kevin's also been making some interesting progress on the side on running large GPT models in the cloud—this could be a viable business direction as well, but I guess the demo would be less cool relative to a true AI design tool.

![10-11]({{"/assets/images/10-11-22.jpg" | prepend: site.baseurl }})

*Some historic Palo Alto territory*

## Day 177: October 12, 2022

Kevin managed to get end to end model inference working now. This is an interesting thread because it's very complicated to get something like this set up/working correctly—if we provided a generalized solution for people to use, it could be very valuable/save people a lot of pain. 

It's surprisingly hard to figure out what the best use of time during the day is—I might spend some time thinking through/writing down the best approach to doing is. It also feels weirdly unproductive to simply think about what to do—just working on something, even if it's suboptimal, seems like a better use of time. I ultimately decided to just bite the bullet and write memos about AI for design and writing.

John is writing a manifesto about data moats/personalized AI. Tae is also digging into AI for writing while continuing to wrap up our official Village manifesto for our quarterly update to investors.

![10-12]({{"/assets/images/10-12-22.jpg" | prepend: site.baseurl }})

*just another day in our office aka our converted dining room*

## Day 178: October 13, 2022

Today, we decided to slash our burn rate to extend our runway from ~19 months to 24 months, which actually required a substantial decrease in what we pay ourselves. I wonder how that'll affect my personal happiness, but hopefully we don't notice it financially.

We dug a bit into what an AI writing tool would entail. It is a thread that I'm personally interested in because I write a good amount (especially compared to design, where I don't do design at all). I would definitely use such a tool for my blog posts, and it seems like a more tractable problem that creating an entire AI design tool. 

John finished his manifesto about why personalized AI/data will be the moats of a future with AI-embedded products. The motivation is to base our ideation around strong hypotheses/takes on the future of the world—I may type up my thoughts on this as well just so we have multiple perspectives.

![10-13]({{"/assets/images/10-13-22.jpg" | prepend: site.baseurl }})
![10-13]({{"/assets/images/10-13-22.3.jpg" | prepend: site.baseurl }})
![10-13]({{"/assets/images/10-13-22.1.jpg" | prepend: site.baseurl }})
![10-13]({{"/assets/images/10-13-22.2.jpg" | prepend: site.baseurl }})

*I think ACE hardware might just be the greatest store on Earth*