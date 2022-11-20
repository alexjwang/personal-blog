---
layout: post
title: "startup logs 6"
date: 2022-11-14
categories:
---

## logs

Our AI text editor is now up and running with all the core functionality in place. This week we're giving the user interface and user experience a little bit of extra attention before we release a small alpha version to our closest friends.

### Day 210: November 14, 2022

Before our meeting today with Ben, our primary mentor, we finished building all the key features of our AI text editor. However, upon demo'ing it to him, it was clear that we still need to polish up a lot of the UI/UX of our product. Immediately after our meeting, we discussed various UX improvements for a couple hours, which was honestly pretty mentally exhausting. It is interesting to me that it took the embarrassment of a suboptimal demo to our mentor to spur this discussion as a team. Having this discussion definitely should have happened a long time ago, before we even started building, but since this originally started out as a simple weekend project, we didn't have this sort of serious design session early on.  There is that startup saying that if you're not embarrassed by your MVP launch, then you launched too late, which seems relevant here, but at the same time, I don't want to launch a bad product to my friends because the feedback will probably be mostly centered around that (and not around more useful things like whether or not the AI suggestions contribute anything).

Evan also came down to visit/work for the day. We went to this diner in Palo Alto (Uni Ave), which was nice but sadly also expensive. Just Palo Alto things I guess.

I'm also writing this log in Orchard itself in the interest of dogfooding our product. I've already found a number of UX improvements that we probably would've otherwise taken a while to discover/solve.

\[CRINGE\](<https://arxiv.org/abs/2211.05826>)

!\[11-14\]({{"/assets/images/11-14-22.jpg" | prepend: site.baseurl }})

_Diner that we went to in Palo Alto ft. John Kim and his peace sign_

### Day 211: November 15, 2022

Today's been a lot of development work as we try to clean up the product. I'm writing this log at the end of the day, and I'm feeling pretty good about how the product is shaping up. While the text editor itself is not super novel (feels a lot like Apple notes), I'm finally able to utilize GPT-3 on my writing in a seamless way. I've been wanting to use it to edit my blog posts for a while now, but the effort required to export my writing to OpenAI's playground, write a good prompt, and then evaluate results is actually greater than just using my brain to edit my writing itself. Now that everything is seamlessly built into the editor, I've been using it constantly to check almost every other sentence. Even though I don't end up accepting most of the suggestions, once in a while it provides a usable edit/inspiration for a good improvement.

I've also started showing some of my close friends the product live in production. There are still some UX improvements to be made, especially since a lot of people are confused by how to use the AI commands (which are obviously intuitive to me and my co-founders since we were the ones building it). This'll be an interesting problem to tackle, especially as we figure out if we want to build a product for the general public or focus on a particular user segment.

\[PapersWithCode just open-sourced a huge LM trained on scientific literature/LaTeX\](<https://github.com/paperswithcode/galai>)

!\[11-15\]({{"/assets/images/11-15-22.jpg" | prepend: site.baseurl }})

_A quick peek at some of the linear tickets closed just today_

### Day 212: November 16, 2022

This was an interesting morning for the Village. I woke up to a text from a friend regarding Notion AI's alpha release, which jarred me fully awake instantly. I yelled "FUUUUUCK" for a solid couple of seconds before rushing into the main room where only Kevin was already awake. Apparently my yelling also woke up Tae, who emerged from his room a few minutes later. When John came down from his room, we asked him if he heard the news, to which he thought somebody had died due to our somber attitudes.

Obviously this was suboptimal for our initial product release plans—I had initially planned to send our alpha to a couple of friends today, garner enough feedback for another set of features, and then launch a more public beta later this week/next week. The fact that Notion released their alpha literally hours before we were planning to was just super unfortunate timing—this is even more frustrating because it's the third time that a competitor announced a product release right before we were planning to do the same. 

This doesn't change much as we knew that this was bound to happen, but it feels surprising because of how fast it was. We're going to double down on our community sourced templates, and try to use our speed to churn out more features/users. This is definitely a situation to monitor, both in terms of user feedback/product development, but also in terms of macro strategy (is Notion even beatable/can there be multiple winners in this space).

This pushes up our release timeline significantly—with discussions regarding Notion AI already proliferating throughout Twitter, it's important to insert our product into these threads to increase visibility and generate feedback.

\[Fuck Notion AI\](<https://www.notion.so/blog/introducing-notion-ai>)

!\[11-16\]({{"/assets/images/11-16-22.jpg" | prepend: site.baseurl }})

_Yassified car_

### Day 213: November 17, 2022

We are passively up to 88 daily active users, which is nice to see because we haven't technically done any sort of public launch (just been passively sharing it with friends). We got a number of key things done today. Some of the main things that I remember:

* John overhauled suggestions to enable scrolling between different suggested edits.
* I built out an onboarding doc that should theoretically help new users try out our product. Something that we were noticing was that because a lot of users didn't have some thing to write, their exploration typically ended up being pretty bad experiences. This might reflect more upon our product, but I think when we do our public launch, it'll be important to maximize the "magic" feeling for our product. But here early on in the alpha, it is also important for us to figure out what parts of our UX is confusing to individuals without any sort of guidance/instruction.

We also had a mini fire where our server went down. Thankfully, not that many people noticed. There's a constant list of bug fixes/small features that we need to get done—despite being super busy, I feel super productive as it's really satisfying to churn through linear tickets and watch our product improve.

\[Benchmarking of every LLM out there\](<https://crfm.stanford.edu/helm/v1.0/?group=question_answering>)

!\[11-17\]({{"/assets/images/11-17-22.jpg" | prepend: site.baseurl }})

!\[11-17-1\]({{"/assets/images/11-17-1.jpg" | prepend: site.baseurl }})


_The duality of man_

### Day 214: November 18, 2022

Not much to update in today's log from a macro perspective. We mostly worked on feature development/bug fixes. I was working on populating our community tab with a bunch of good templates—it was actually really fun to run random prompts on text and see the outputs. Some were quite funny—my favorite was a prompt for writing a micro horror story. John has been working on a command overhaul and Kevin just cranks out PRs for random stuff left and right (a true stallion). I don't write logs over the weekend (we do still work weekends), but I'd imagine our weekend will consist mostly of grinding out more code.

\[GPT-3 accuracy at fraction of the cost\](<https://twitter.com/SnorkelAI/status/1593764691628548097?s=20&t=YP1TJy0qKm5sw7gpIUE3dg>)

!\[11-18\]({{"/assets/images/11-18-22.jpg" | prepend: site.baseurl }})

_Mini high school reunion!_