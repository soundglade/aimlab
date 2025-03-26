import { GetStaticProps, GetStaticPaths } from "next";
import { getAllPostSlugs, getPostData, BlogPost } from "@/lib/blog";
import { PostLayout } from "@/components/blog/PostLayout";

interface PostProps {
  post: BlogPost;
}

export default function Post({ post }: PostProps) {
  return <PostLayout post={post} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const post = await getPostData(slug);
  return {
    props: {
      post,
    },
  };
};
