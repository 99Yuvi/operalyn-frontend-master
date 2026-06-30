/** Centralised React Query key factory — prevents cache key typos */
export const authKeys = {
  me: () => ['auth', 'me'],
}

export const projectKeys = {
  all:    ()           => ['projects'],
  lists:  ()           => ['projects', 'list'],
  list:   (params)     => ['projects', 'list', params],
  detail: (id)         => ['projects', id],
  mine:   ()           => ['projects', 'mine'],
}

export const proposalKeys = {
  all:        ()       => ['proposals'],
  forProject: (id)     => ['proposals', 'project', id],
  mine:       ()       => ['proposals', 'mine'],
  detail:     (id)     => ['proposals', id],
}

export const contractKeys = {
  all:    ()           => ['contracts'],
  list:   (params)     => ['contracts', 'list', params],
  detail: (id)         => ['contracts', id],
}

export const conversationKeys = {
  all:      ()         => ['conversations'],
  messages: (id)       => ['conversations', id, 'messages'],
}

export const paymentKeys = {
  all:    ()           => ['payments'],
  list:   (params)     => ['payments', 'list', params],
}

export const freelancerKeys = {
  all:    ()           => ['freelancers'],
  list:   (params)     => ['freelancers', 'list', params],
  detail: (id)         => ['freelancers', id],
  profile: ()          => ['freelancers', 'profile'],
}

export const notificationKeys = {
  all: ()              => ['notifications'],
}
