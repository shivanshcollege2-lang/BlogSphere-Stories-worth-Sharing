import BlogPost from './models/BlogPost.js';
import User from './models/User.js';

export const DEMO_CREDENTIALS = {
  name: 'BlogSphere Demo Writer',
  email: 'writer@blogsphere.local',
  password: 'BlogSphereDemo123!'
};

const demoPosts = [
  {
    title: 'The Quiet Art of Paying Attention',
    category: 'Ideas',
    tags: ['attention', 'everyday life'],
    content: `We tend to think that a meaningful life is made from extraordinary moments. But most of our days are made from ordinary things: the walk to the station, the light on the kitchen wall, a conversation that lasts a little longer than expected.

Paying attention is a small practice with a surprisingly generous return. It asks us to look again before deciding that we already know what we are seeing. A familiar street becomes a collection of little details; a familiar person gets to surprise us.

There is no perfect routine for noticing more. Begin with one thing. Put your phone away on the way home. Ask a follow-up question. Watch the afternoon light move across a room. These moments will not make life louder, but they may help you hear it more clearly.`,
    author: null
  },
  {
    title: 'Making Room for a Slower Kind of Morning',
    category: 'Life',
    tags: ['slow living', 'rituals'],
    content: `A morning does not have to begin with a perfect routine, a color-coded planner, or a sunrise workout. Sometimes a slower start is simply the decision not to let the first five minutes belong to a screen.

I started leaving a glass of water beside the kettle and a book open on the table. The ritual is unremarkable, which is precisely why it works. It asks for no special equipment and no new version of myself.

The day still gets busy. Messages still arrive. But beginning with one deliberate choice reminds me that attention is something I can offer, not just something the world can take.`,
    author: null
  },
  {
    title: 'Why Small Creative Habits Outlast Big Plans',
    category: 'Culture',
    tags: ['creativity', 'practice'],
    content: `The blank page can make creativity feel like a performance. We wait for the perfect idea, the perfect hour, or the sudden confidence that will turn a hobby into a finished project.

A small habit is less dramatic and more dependable. Ten lines in a notebook, one photograph on a walk, or a rough sketch before lunch gives an idea somewhere to land. Repetition is not the enemy of inspiration; it is often how inspiration learns where to find us.

The work does not need to be impressive on the day it is made. It only needs to exist. Over time, the little pieces begin to speak to one another, and a practice becomes a body of work.`,
    author: null
  }
];

export async function seedDemoData() {
  let author = await User.findOne({ email: DEMO_CREDENTIALS.email });
  if (!author) {
    author = await User.create(DEMO_CREDENTIALS);
  }

  const postsExist = await BlogPost.exists({ author: author.id });
  if (!postsExist) {
    await BlogPost.insertMany(demoPosts.map((post) => ({ ...post, author: author.id })));
  }

  return { author, postCount: await BlogPost.countDocuments({ author: author.id }) };
}
