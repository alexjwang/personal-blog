---
layout: post
title: "startup logs 19"
date: 2023-03-17
categories:
---
# logs

We've launched our sneak peek. GPT-4 comes out this week, and we're gearing up for a larger launch.

## Day 329: Monday, March 13, 2023

I've been feeling a little bit of FOMO in regard to not working on core engineering tasks as much recently, so I decided last week to take on integrating web search into our LLM, which touches all parts of our codebase (also serves as a way for me to refamiliarize with how our code has evolved). 

When doing a startup, I feel like often there's a balance to be struck between doing random small things to keep the company going, but there's also a more selfish want to be working on the things that generate the most learning for yourself. I think I'd been feeling a little demoralized from working on unstructured, nontechnical tasks for so long—while loose ends need to be wrapped up by someone, it's also hard to feel like you're being productive if you're not finishing up huge engineering tasks. Also, at the end of the day, I've been specializing in technical work for pretty much my entire life, and I just feel a lot more comfortable working on those types of problems.

## Day 330: Tuesday, March 14, 2023

Working on the larger websearch dev task has been a super welcome break from all the unstructured work I'd been previously doing. I wrapped it up today, and although the process involved a lot of challenging subproblems, I quite enjoyed the overall process (and in particular, the satisfaction of merging in the PR).

I learned a lot of the things I wanted to learn from taking on this task, although I am rather hyperaware of all the loose ends that are now unassigned to anyone (we still need to finish all of it before we launch).

## Day 331: Wednesday, March 15, 2023

Today was a huge day in the realm of AI. GPT-4's long awaited announcement (<https://openai.com/research/gpt-4>) finally came, and with it, a slew of AI products.

Our initial toying around with the model didn't leave us the most impressed—it does improve in several areas, but the thing that I was personally most hyped about was the increased context window. The currently released version doesn't seem to handle it that much better than ChatGPT.

We're currently on the waitlist for GPT-4. Once we're off, we'll experiment with it more and decide if it's worth switching to. However, as of right now, ChatGPT's API offering is significantly cheaper and serves our needs just fine.

## Day 332: Thursday, March 16, 2023

Today was a rather big day for us—Microsoft announced their Office Copilot: <https://blogs.microsoft.com/blog/2023/03/16/introducing-microsoft-365-copilot-your-copilot-for-work/>. We expected Microsoft to come out with this feature announcement at some point, but we didn't think it would come out for another year. The fact that it was announced so early was rather surprising—not sure if this is actually the case, but it seems like big tech may be moving quickly for once. It doesn't help that they always have a head start in the form of having early access to all the models months before we do—Microsoft owning the compute, ML research, and application layer for everything AI finally illuminated for me the power of these tech companies.

Where we go from here will be interesting, but as of right now, the plan stays the same. We'll continue moving forward with our launch, see what kind of traction/user feedback we get, and iterate from there. After the initial discouragement from the announcement, I feel a lot better about things—we have plans for how to navigate from here on out. It is kinda crazy how fast things are moving in this space—sometimes it's exciting, but a lot of times (today included), it's pretty overwhelming.

## Day 333: Friday, March 17, 2023

Today was business as usual. I continued working on polishing up web search—I switched us to Google's API instead of Bing because their pricing and terms and conditions are a lot more generous. It appears that Bing does not want anyone to build any AI applications on top of their API, which kind of makes sense, given that Bing AI is literally an AI application on top of their API. However, I'm still a little disappointed that they're so explicit in preventing it.