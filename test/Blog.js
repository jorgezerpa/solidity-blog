// test/Blog.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const markdownPostTitle = `# SpaceX: Revolutionizing Space Exploration`
const markdownPost = `
SpaceX, a pioneering aerospace manufacturer and space transportation company, has been at the forefront of revolutionizing the space industry. Founded by visionary entrepreneur Elon Musk, SpaceX has achieved remarkable milestones and is reshaping the future of space exploration.



### Reusable Rockets: A Game-Changer

One of SpaceX's most significant accomplishments is the development of reusable rockets. Traditional rockets are discarded after a single use, making space launches incredibly expensive. SpaceX's reusable rockets, such as the Falcon 9 and Falcon Heavy, can be recovered and refueled for subsequent launches, significantly reducing the cost of space travel. This innovation has opened up new possibilities for frequent and affordable access to space.



### Human Spaceflight: A New Era

Another groundbreaking achievement is SpaceX's development of the Dragon spacecraft. Initially designed for cargo missions to the International Space Station (ISS), Dragon has evolved into a spacecraft capable of carrying astronauts. SpaceX became the first private company to launch astronauts to the ISS, marking a historic moment in commercial spaceflight.



### Mars Colonization: The Ultimate Goal

Beyond Earth orbit, SpaceX has ambitious plans for Mars colonization. The company's ultimate goal is to establish a self-sustaining human settlement on Mars. To achieve this, SpaceX is developing the Starship, a fully reusable spacecraft designed for interplanetary travel. Starship is envisioned as the vehicle that will transport humans and cargo to Mars, paving the way for a new era of human exploration.



### Inspiring the Future

SpaceX's innovative approach and relentless pursuit of technological advancements have inspired countless individuals and organizations. The company's achievements have not only reduced the cost of space travel but have also sparked renewed interest in space exploration. As SpaceX continues to push the boundaries of what is possible, it is clear that the company will play a pivotal role in shaping the future of humanity's journey into the cosmos.
`

describe("Blog Contract", function () {
    async function deployBlogFixture() {
        const Blog = await ethers.getContractFactory("Blog");
        const blog = await Blog.deploy();

        const [owner, addr1, addr2] = await ethers.getSigners();

        return { blog, owner, addr1, addr2 };
    }

    describe("Deployment", function () {
        it("Should deploy the contract", async function () {
            const { blog, owner } = await loadFixture(deployBlogFixture);
            expect((await blog.getPosts()).length).to.be.equal(0)
        });
    });

    describe("Post Creation", function () {
        it("Should create a new post", async function () {
            const { blog, owner } = await loadFixture(deployBlogFixture);
            await blog.createPost(markdownPostTitle, markdownPost);
            const post = await blog.getPost(0);
            expect(post.title).to.equal(markdownPostTitle);
            expect(post.content).to.equal(markdownPost);
            expect(post.author).to.equal(owner.address);
        });
        it("Should emit PostCreated event", async function () {
            const { blog, owner } = await loadFixture(deployBlogFixture);
            await expect(blog.createPost("Post title", "Content"))
                .to.emit(blog, "PostCreated")
                .withArgs(0, owner.address);
        });
    });

    describe("Post Retrieval", function () {
        it("Should return the correct post", async function () {
            const { blog } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await blog.createPost("Second Post", "Content");
            const post1 = await blog.getPost(0);
            const post2 = await blog.getPost(1);
            expect(post1.id).to.equal(0);
            expect(post2.id).to.equal(1);
        });

        it("Should return all posts", async function () {
            const { blog } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await blog.createPost("Second Post", "More content");
            const posts = await blog.getPosts();
            expect(posts.length).to.equal(2);
        });
    });

    describe("Post Update", function () {
        it("Should update the post content", async function () {
            const { blog, owner } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await blog.updatePost(0, "Updated Title", "Updated Content");
            const post = await blog.getPost(0);
            expect(post.title).to.equal("Updated Title");
            expect(post.content).to.equal("Updated Content");
        });

        it("Should emit postUpdated event", async function () {
            const { blog, owner } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await expect(blog.updatePost(0, "Updated Title", "Updated Content"))
                .to.emit(blog, "PostUpdated")
                .withArgs(0, owner.address);
        });

        it("Should revert if a non-author tries to update the post", async function () {
            const { blog, addr1 } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await expect(blog.connect(addr1).updatePost(0, "New Title", "New Content"))
                .to.be.revertedWith("Only the author can update the post");
        });
    });

    describe("Ban posts", function(){
        it("It should ban post", async function () {
            const { blog } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await blog.banPost(0);
            const post = await blog.getPost(0);
            expect(post.isBanned).to.be.true;
        })
        it("It should revert banPost call", async function () {
            const { blog, addr1 } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await expect(blog.connect(addr1).banPost(0))
                .to.be.revertedWithCustomError(blog, "OwnableUnauthorizedAccount")
                .withArgs(addr1)
        })
    })

    describe("Post Liking and Disliking", function () {
        it("Should increment likes on likePost", async function () {
            const { blog } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await blog.likePost(0);
            const post = await blog.getPost(0);
            expect(post.likes).to.equal(1);
        });

        it("Should emit PostLikedDislikedEvent", async function () {
            const { blog, owner } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await expect(blog.likePost(0))
                .to.emit(blog, "PostLikedDisliked")
                .withArgs(0, owner.address, true);
        });

        it("Should increment dislikes on dislikePost", async function () {
            const { blog } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await blog.dislikePost(0);
            const post = await blog.getPost(0);
            expect(post.dislikes).to.equal(1);
        });

        it("Should emit PostLikedDislikedEvent", async function () {
            const { blog, owner } = await loadFixture(deployBlogFixture);
            await blog.createPost("First Post", "Content");
            await expect(blog.dislikePost(0))
                .to.emit(blog, "PostLikedDisliked")
                .withArgs(0, owner.address, false);
        });
  });
});