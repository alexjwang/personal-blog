---
layout: post
title: "startup logs 4"
date: 2022-10-31
categories:
---
## logs
We are continuing to build out our AI product. We have the infrastructure for our model finished, but we need to improve the model's performance. We are also going to work on projects on the side/weekends to improve our presence in the AI community.

### Day 196: October 31, 2022
Today was a big day in terms of deadlines but surprisingly passed by quickly. I had a user interview call earlier in the morning with the CEO of an interior design startup about UI/UX design at startups. Then, I spent a couple hours with John going over his fine-tuning pipeline code-there's still a lot of room for improvement in terms of our model performance, so I'm going to try to parallelize some tasks with him to help out.

I think I'm also going to focus exclusively on how to build up our reputation in the AI space (which seems to live on Twitter). In this sort of space, racing for distribution seems to be rather exigent—it also happens to be our biggest weakness, and my goal over the next month is to turn this weakness into a strength. To that end, we'll try to ship out a text editor quickly.

[What is AGI hard](https://lspace.swyx.io/p/agi-hard)

![10-31]({{"/assets/images/10-31-22.jpg" | prepend: site.baseurl }})
*They should have this warning label when you try to download League of Legends.*

### Day 197: November 1, 2022
Wow, it's already November. Kevin, Tae, and I are starting to work on a text editor (should be faster to ship than an AI design tool). We found some open-source text-editor framework that seems to be pretty good—we're going to start from there and start implementing AI features later. John refactored our stable-diffusion training pipeline. 

On the side, I'm running a couple of experiments to see if we can't bootstrap our startup with some simple wrappers around GPT-3/stable diffusion.

[I'm pretty sure there's a Black Mirror episode on exactly this](https://twitter.com/dsiroker/status/1587415342896148480?s=20&t=P_pDHH7GSN0ff4wDruU5wQ)

![11-1]({{"/assets/images/11-1-2022.jpg" | prepend: site.baseurl }})
*My new French Press for making coffee when I forget to prep my cold brew the night before (happens more often than not).*

### Day 198: November 2, 2022
Today, Kevin, Tae, and I continued working on building out features for our new AI text editor. We have text generation working/all the other features you'd expect out of a text editor. I'm currently working on text editing/rewording—this is a little trickier because we have to imagine a totally different UI for this (aside from just appending text afterwards).

Something really cool happened—one of the founders of Airplane reached out to us, and we're going to have a call with them next Friday. I don't really know what to expect, but I think it'll be really nice just to chat with them.

[AI for creativity](https://twitter.com/anthilemoon/status/1587382500615245824?s=20&t=fVO2j3dPKRqBO0CbV-Kbpg)

![11-2]({{"/assets/images/11-2-2022.jpg" | prepend: site.baseurl }})
*Randomly fancily colorful drinks at this ramen place!*

### Day 199: November 3, 2022
Not a ton of updates today, it's mostly been code monkey work (I've personally getting destroyed by the prosemirror docs). We should be able to crank out most of the features by the end of this week, which I'm excited by.

It is also my birthday though (finally 22) so yay!

![11-3]({{"/assets/images/11-3-22.jpg" | prepend: site.baseurl }})
*Weather in Palo Alto has been getting chilly recently (relatively speaking of course)*

### Day 200: November 4, 2022
Wow day number 200—it's crazy to think about how long it's been, and even crazier to think about how quick it felt (it feels like the start of the Neo accelerator was just last month).

We're still in the midst of feature developing. I'm building edit suggestions—the UX flow I'm currently imagining is generating edit suggestions for a selected section, look through the options, and click to accept. Tae is almost done with getting/populating templates for each user as well as a Cmd-K interface. We can hopefully launch this sometime next week.

[DALL-E API Public Beta Release](https://openai.com/blog/dall-e-api-now-available-in-public-beta/)

["I used LLMs to destroy LLMs"](https://arxiv.org/abs/2211.01910)

![11-4]({{"/assets/images/11-4-22.jpg" | prepend: site.baseurl }})
*This random cat walked into our house this morning.*