---
layout: post
title: "startup logs 2"
date: 2022-10-17
categories:
---
## logs
We are heading deeper into product development this week.

### Day 182: October 17, 2022
John has gotten Figma code generation from json working for mostly everything. What's left is data labelling for training our model, and figuring out how to actually make the model good. I'm digging deeper into an AI writing tool. Kevin has finished his initial exploration into hosted GPUs and is continuing to read more academic/developer literature on generative AI.

![10-17]({{"/assets/images/10-17-22.JPG" | prepend: site.baseurl }})

*Got new plants*

### Day 183: October 18, 2022
We're continuing to play around with component generation to slowly improve it. Currently, setting properties such as colors is difficult, but creating the components themselves from prompts is possible. The prompts themselves are more component descriptions rather than what humans would actually write, but getting the model working is more important than UI/UX atm, which will come later.

![10-18]({{"/assets/images/10-18-22.jpg" | prepend: site.baseurl }})

*Tae and John playing around with Figma component generation*

### Day 184: Octoboer 19, 2022
We're still working on developing conviction on AI for design. To that end, we are returning back to hypothesis validation. However, we are still spending the bulk of our time on technical exploration.

We have a research channel where we send each other links. I'm going to attach one interesting link every day if people are interested in reading what we read.

This is an interesting [Twitter thread](https://twitter.com/Buntworthy/status/1582307817884889088?s=20&t=-l9Lkw3PQtO73tw2oZ9k2g) that showcases how good people are getting at fine-tuning LLMs.

![10-19]({{"/assets/images/10-19-22.jpg" | prepend: site.baseurl }})

*Evan came down today to SF to visit*

### Day 185: October 20, 2022
We had a standup today where we defined our plan more concretely. Almost everything about our current idea of building an AI design tool is good except we have a huge question mark about whether or not it will solve a real need for users. This is somewhat ironic because up to this point, our entire ideating process revolved about hypothesis testing/customer discovery. 

Some things we talked about in our meeting:
- The tasks that we need to get done
- Set deadlines for when we need to accomplish tasks by (we have a meeting with our investor, Ali, on October 31st)
- Listed out initial features that we want to build

We are loosely operating under the assumption that all the features that we can think of, we can also build. This is a rather strong assumption, especially because we are working with bleeding edge technology, but it's also a nice moat in the sense that only teams with really strong ML engineers can hope to compete with us. Whether or not we are strong enough at ML engineering will remain a question for the near future, but this is a bet I'm happier to take because it is within our control.

We are full sending on AI design for now—if things go well with our demo video, we may be looking to raise and hire within the year although this is getting way ahead of ourselves (I honestly do get very excited by the thought of progress/traction thhough).

Another interesting [Twitter thread](https://twitter.com/mihail_eric/status/1582768388060741634?s=20&t=NVvzDmLYIQokmtL7KVNF1w) on what people are doing to work with LLMs (specifically prompt engineering). Definitely something that my team and I are looking at to improve how we work with our LLMs. 

![10-20]({{"/assets/images/10-20-22.jpg" | prepend: site.baseurl }})
*Bought a new HHKB keyboard so my typing in the work area isn't as loud lol*

### Day 186: October 21, 2022
Status updates for today:

- Kevin is working on creating an intermediate language for Figma components that will work better with our models.

- John is working on getting out an early draft of our demo video. This should be our first public release coming out of stealth as a company.

- Tae is working on writing our manifesto, both for internal use as well as an update for our investors.

User research calls have been interesting. I think our first call was a little disheartening because it appears that designers at large companies are rather similar to engineers in the sense that they are mostly there to problem solve (how to make a design using available tools). The value add is less apparent because there seems to be entire design systems/constraints set up such that there is not as much creativity as one would think for a design job. Our second call, with one of the founders in our accelerator cohort, was much better validation. His view/workflow with design and Figma is similar to ours, which is where we drew initial inspiration for this sort of solution. They heavily utilize a senior designer to produce high fidelity designs, which the founders then can easily verify whether or not they like it. The hope would be that our tool would effectively replace a senior designer, unlocking creative work for non-designers.

[TRLX pushes out some major changes, looks pretty clean/easy to use now](https://twitter.com/carperai/status/1583585613416390657?s=20&t=ik6mXSIjqH-AsIfST3CUng)

[Scale also jumps on the human feedback train](https://twitter.com/scale_AI/status/1582890586834489344?s=20&t=V4sAHr1MWCX2grjgimqpGA)

[New RLHF model](https://arxiv.org/abs/2210.11416)

[IBM shows that fine-tuned models are pretty good, even when they're small](https://research.ibm.com/blog/ai-for-code-project-wisdom-red-hat)

![10-21]({{"/assets/images/10-21-22.jpg" | prepend: site.baseurl }})