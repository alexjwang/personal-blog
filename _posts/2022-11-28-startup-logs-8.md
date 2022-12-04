---
layout: post
title: "startup logs 8"
date: 2022-11-28
categories:
---
# logs

Our primary objective this week is to get our AI suggestions for edits/autocompletions to be really good. This is the key improvement that needs to happen before our product becomes truly usable. 

### Day 223: November 28, 2022

Our first approach for improving our AI suggestions is prompt engineering. Fine-tuning custom models on writing examples and using it from OpenAI will increase our costs by 6x, which probably completely ruins our unit economics. John has been going especially ham on a bunch of approaches for prompting—definitely making some progress along this front, but we're still pretty far from the ideal. The main problems with text generation, as far we can see, are that there tends to be a lot of context stored within the writer's brain (not a trivial problem) and that GPT-3 tends to have a very particular voice (comes across as generic and not that great of a speaker/writer).

Text-DaVinci-003 also dropped today, which was convenient timing. Our edit suggestion results instantly improved as a result—the model seems to be better at handling longer selections (paragraphs) and also at generating a wider variety of suggestions. This makes me think that ultimately perhaps the way to go is not prompt engineering, but rather training a model on more data (including more diverse and human-generated examples) in order to better generalize from it. 

![11-28]({{"/assets/images/11-28-22.PNG" | prepend: site.baseurl }})

*We've been playing this new game survivor.io (on app store) and now all of us + our friends are addicted.*

### Day 224: November 29, 2022

We're still hyper focused on improving the quality of our AI suggestions (this'll make the biggest improvement in the usefulness of our product). The interesting thing to note here is that, with the release of text-DaVinci-003 yesterday, our models are performing much better with little prompt engineering—this does kinda mean that our previous couple days' worth of effort around prompt engineering was somewhat wasted, but this is overall a win anyways. The timing is quite convenient, and I'd much rather waste a few days than a month. John in particular has been focusing a ton on prompt engineering, and we should be able to roll out a number of extremely solid default templates soon. The reasoning behind default templates is mostly that a lot of users are not going to be able to understand how to prompt the model with good instructions/commands, so this way we can simultaneously remove that requirement while also showing examples of what good prompts look like. Kevin works a lot on general bug fixes/UX improvements, and Tae is focused on changing our AI suggestions from plaintext to rich text (specifically Markdown). The reasoning behind this is that there should be a lot of semantic meaning captured by things like line breaks, headers, bold face, links, etc. that are lost when you only have plain text.

While jotting down some notes for a future blog post, I started thinking about the different user segments that we should target. Current AI writing tools (e.g. Jasper/CopyAI) target copywriters and marketing content creators—these user segments care mostly about quantity over quality. This is perfect for the current capabilities of GPT-3: providing bulk content quickly and cost-effectively. On the other hand, you have professional writers who still do write a lot, but quality is of utmost importance—they make money based off of the quality of their writing, rather than how many pieces they push out. This means that current writing tools are worse than useless—not only are they incapable of generating content that matches this level of quality/personal voice, but it actually takes effort to seek out and reject the bad results. The following is a quote from an internal memo I wrote that's relevant:

> I do think we should continue focusing on professional bloggers and content creators as one of our initial target customers.
>
> However, there are a few points where I believe we'll face resistance:
>
> * Professional blog writers care a lot about writing style/voice, and all the good ones have their own personalized preferences for what "good" writing looks like. This makes it more difficult for us, especially in the beginning before we have personalized suggestions, to provide an ideal experience for them.
> * Along these lines, they have a much higher bar for quality than most other groups. Their content is tightly tied to their identity, and therefore any mistake by our model will be unacceptable to them. In the beginning, making our product feel magical to them will be a very tall task.
>
> These two points make me believe that a better initial target user archetype will be those that share all the pros that I talked about in my initial message, but also have a set of criteria for quality that will be plausible to match within the near future for a good initial product. Namely, we want to have generalizable passive edit suggestions and autocompletions that doesn't also require us to build out infrastructure for personalized data flywheels. Ultimately, we will need to build these, but I believe that we also want to acquire users along the way, and this will be a good first step.
>
> Off the top of my head, I believe the two groups that fit the above criteria are students and hobbyist writers/bloggers like myself. There is one notable con here that shouldn't be quickly overlooked: these users are typically not paying users. However, I believe that we should still focus on these users—our priority should be to deliver a magical experience to users first, and then figure out how to monetize later after we've captured the bottoms up market. From what I know, Notion also used to be in a similar boat before, and it seemed to work out for them. 
>
> For students, there is the added benefit of extreme potential for virality, and we know that they can carry over platform preferences to workplaces (which will be important for our bottoms up approach to capturing this market).

To validate these claims, I did two quick user interviews of founder archetypes, which gave some pretty interesting insights. Here's the summary I wrote for my findings:

> * I think the key insight is that the two components for good writing of this nature is: good insights and good personal voice. For this specific archetype, often the trouble does not lie within the insights (they just passively come over time, and the lack of insights is not an issue because writing is not integral to their job functions/daily lives), but rather developing and applying a great personal writing voice to these insights.
>   * To this end, the ideal experience would be an AI writing assistant that understands your ideal writing voice and automatically helps form your streams of consciousness into great writing.
> * This also extends to business applications (hence the founder archetype). A lot of communications actually take a while to write because making it presentable/conveying a good writing voice are actually nontrivial tasks. Specifically, applying a personalized voice to your writing is a criminally underserved need by most writing tools (Jasper/CopyAI fail miserably at this).
> * When sharing writing for people to edit, it's never really about grammar/spell checking/even style. It's more about clarity of argument, whether or not there are assumptions about the reader's knowledge being made. Sometimes, they share it with people that know them super well because they have a lot of context into the exact voice that the writer is trying to implement, and they have a lot of context into what the writer is trying to accomplish with that piece. This is something that writing tools fail to do (writing is often such a personalized task that a generalized model fails terribly at capturing the real value adds).
> * People state that they would definitely pay for a writing tool that brings nonlinear returns (proof is that they already pay for related writing tools). Not sure how much stock we want to put into this, but it is promising that people are at least cognizant of the value that better/more efficient writing brings to them.

Talking is pretty tiring, but today felt pretty productive (despite me not writing any code).

![11-29]({{"/assets/images/11-29-22.JPG" | prepend: site.baseurl }})

*Rain is very trippy at night.*


### Day 225: November 30, 2022

This morning we talked to Linus Lee, who's doing a lot of interesting work regarding LLMs. He introduced us to a few interesting concepts/ideas, and we ended up talking for an hour about various topics. Aside from that, we are starting to overhaul a lot of our features, including the command bar and passive edits—between this and our improvements to our AI model suggestions, we should have a product that's ready to show investors/have a public launch. Despite the long hours, I feel proud of what we have achieved.

ChatGPT was also released recently. We have been playing around with it a ton—it's actually really good at a number of tasks. There's a lot to think about here.

![11-30]({{"/assets/images/11-30-22.JPG" | prepend: site.baseurl }})

*Spotify wrapped is actually some genius advertising technique. I really don't understand why Spotify hasn't leaned more into social stuff revolving music.*


### Day 226: December 1, 2022

I've doing a deeper dive into ChatGPT, and all its possible implications. I actually managed to spit out a semi-decent blog post just from 4 minute interaction with ChatGPT—typically blog posts take me several hours to write. While the blog post's style doesn't match my personal style, this does show a lot of promise.

![12-1]({{"/assets/images/12-1-22.jpg" | prepend: site.baseurl }})

*We went to a tiki bar in SF where I met up with some friends—really fun night that reminded me of college shenanigans.*


### Day 226: December 2, 2022

Drawing inspiration from the success of ChatGPT (our Twitter feeds are inundated with everyone posting screenshots of ChatGPT capabilities), we've decided to do a complete overhaul of our UI/UX. Specifically, we're going to replace all of our edit suggestions with a chatbot interface. The reasoning behind this is that my interaction with the AI to edit my writing was less a series of features that I press to change my writing, but rather a natural conversation with an AI writing consultant. This is better for a number of reasons. First, users used to expect perfection from our AI models' suggestions because it looked like software features to them, rather than an interface to an AI. Making it more apparent that you're talking to an AI makes users more forgiving of any imperfections, and users are better at conversing with a chatbot versus prompting a LLM.

![12-2]({{"/assets/images/12-2-22.jpg" | prepend: site.baseurl }})

*Went to our friends' poker night in SF. They have an insanely nice apartment.*
