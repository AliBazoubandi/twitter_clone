import client from 'api/client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import pick from 'lodash/pick';
import { getFilteredQuery, objToQueryString } from './queryHelpers';
import { useAlert } from 'context/AlertContext';
import { useUser } from 'context/UserContext';
// import Cookies from 'js-cookie';

// const jwtToken = Cookies.get('token');
// function getCookie(name) {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(';').shift();
// }
// console.log('%%%%%%%%%%%%%%%',getCookie('token'));


function useFeedTweets() {
  const fetchFeedTweets = ({ pageParam = 1 }) =>
    client.get(`/tweets/feed?page=${pageParam}`).then((res) => res.data);

  return useInfiniteQuery(['tweets', 'feed'], fetchFeedTweets, {
    getNextPageParam: ({ page, totalPages }) =>
      page < totalPages ? page + 1 : undefined,
  });
}

function useTweets(query = {}) {
  const pickedQuery = pick(query, [
    'sortBy',
    'limit',
    'author',
    'likes',
    'retweets',
    'replyTo',
  ]);

  const filteredQuery = getFilteredQuery(pickedQuery);

  const fetchTweets = ({ pageParam = 1 }) => {
    const queryString = objToQueryString({ ...filteredQuery, page: pageParam });

    return client.get(`/tweets/`).then((res) => res.data);
  };

  return useInfiniteQuery(['tweets', filteredQuery], fetchTweets, {
    getNextPageParam: ({ page, totalPages }) =>
      page < totalPages ? page + 1 : undefined,
  });
}

function useTweet(id) {
  return useQuery(['tweets', id], () =>
    client.get(`/tweets/${id}`).then((res) => res.data)
  );
}

function useCreateTweet() {
  const queryClient = useQueryClient();
  return useMutation((newTweet) => client.post('/tweets', newTweet), {
    onSuccess: () => {
      queryClient.invalidateQueries('tweets');
    },
  });
}

function useRemoveTweet(queryKey = ['tweets', {}]) {
  const queryClient = useQueryClient();
  const { setAlert } = useAlert();

  return useMutation((tweetId) => client.delete(`/tweets/${tweetId}`), {
    onMutate: async (tweetId) => {
      if (typeof queryKey[1] === 'string') {
        // Single tweet
        return;
      }

      await queryClient.cancelQueries(queryKey);

      const previousTweets = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.filter((tweet) => tweet._id !== tweetId),
        })),
      }));

      return { previousTweets };
    },
    onError: (_err, _tweetId, context) => {
      setAlert({ type: 'error', msg: 'Something went wrong...' });
      if (context.previousTweets) {
        queryClient.setQueryData(queryKey, context.previousTweets);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('tweets');
    },
  });
}

function useTweetLike(queryKey = ['tweets', {}]) {
  const queryClient = useQueryClient();
  const authUser = useUser();
  const { setAlert } = useAlert();
  
  return useMutation((tweetId) => client.post(`/tweets/${tweetId}/like`), {
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries(queryKey);

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (old.tweet) {
          // Single tweet
          return {
            ...old,
            tweet: {
              ...old.tweet,
              likes: [...old.tweet.likes, authUser._id],
            },
          };
        } else {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.map((tweet) => {
                debugger
                console.log('sdfsdfsdf',tweetId)
                if (tweet._id !== tweetId) return tweet;

                return {
                  ...tweet,
                  likes: [...tweet.likes, tweet.user._id],
                };
              }),
            })),
          };
        }
      });

      return { previousData };
    },
    onError: (_err, _tweetId, context) => {
      setAlert({ type: 'error', msg: 'Something went wrong...' });
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries('tweets');
    },
  });
}

function useTweetUnlike(queryKey = ['tweets', {}]) {
  const queryClient = useQueryClient();
  const authUser = useUser();
  const { setAlert } = useAlert();

  return useMutation((tweetId) => client.delete(`/tweets/like/${tweetId}`), {
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries(queryKey);

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (old.tweet) {
          return {
            ...old,
            tweet: {
              ...old.tweet,
              likes: old.tweet.likes.filter((id) => id !== authUser._id),
            },
          };
        } else {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((tweet) => {
                if (tweet._id !== tweetId) return tweet;

                return {
                  ...tweet,
                  likes: tweet.likes.filter((id) => id !== authUser._id),
                };
              }),
            })),
          };
        }
      });

      return { previousData };
    },
    onError: (_err, _tweetId, context) => {
      setAlert({ type: 'error', msg: 'Something went wrong...' });
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries('tweets');
    },
  });
}

export {
  useFeedTweets,
  useTweets,
  useTweet,
  useCreateTweet,
  useRemoveTweet,
  useTweetLike,
  useTweetUnlike,
};
