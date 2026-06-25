import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_QUERIES, DATA_CONNECT_MUTATIONS} from '../dataconnect/operations';
import {toISODate} from '../../utils/helpers/dateHelpers';

const PAGE_SIZE = 50;

const toNotice = row => ({
  id: row.id,
  branchId: row.branchId,
  authorId: row.authorId,
  author: row.author?.fullName || 'School',
  title: row.title,
  body: row.body,
  category: row.category || 'Academic',
  pinned: row.pinned ?? false,
  date: row.date,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const sortPinnedFirst = notices =>
  [...notices].sort((a, b) => {
    if (a.pinned === b.pinned) {return 0;}
    return a.pinned ? -1 : 1;
  });

const noticesService = {
  async getNotices({branchId, category, pageSize = PAGE_SIZE} = {}) {
    if (!branchId) {return [];}
    try {
      let response;
      if (category && category !== 'All') {
        response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_NOTICES_BY_BRANCH_CATEGORY, {
          branchId,
          category,
          limit: pageSize,
          offset: 0,
        });
      } else {
        response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_NOTICES_BY_BRANCH, {
          branchId,
          limit: pageSize,
          offset: 0,
        });
      }
      const rows = response.notices || [];
      return sortPinnedFirst(rows.map(toNotice));
    } catch (err) {
      console.warn('[NoticesService] getNotices failed:', err?.message);
      return [];
    }
  },

  // DataConnect does not support real-time subscriptions.
  // Callers that previously used onSnapshot should switch to polling via useQuery.
  // This stub is kept so screens that still call subscribeNotices get a one-shot
  // fetch and an empty unsubscribe function, preventing crashes.
  subscribeNotices({branchId, category, onUpdate, onError}) {
    this.getNotices({branchId, category})
      .then(onUpdate)
      .catch(err => {if (onError) {onError(err);}});
    return () => {};
  },

  async createNotice({title, body, category, branchId, author, authorId, pinned = false}) {
    if (!title?.trim()) {throw new Error('Notice title is required.');}
    if (!body?.trim()) {throw new Error('Notice body is required.');}
    if (!branchId) {throw new Error('Branch ID is required.');}
    if (!authorId) {throw new Error('Author ID is required.');}
    const today = toISODate();
    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_NOTICE, {
      branchId,
      authorId,
      title: title.trim(),
      body: body.trim(),
      category: category || 'Academic',
      pinned: Boolean(pinned),
      date: today,
    });
    return response?.notice_insert?.id || null;
  },

  async updateNotice(noticeId, updates) {
    if (!noticeId) {throw new Error('Notice ID required.');}
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.UPDATE_NOTICE, {
      id: noticeId,
      title: updates.title,
      body: updates.body,
      category: updates.category,
      pinned: Boolean(updates.pinned),
    });
  },

  async deleteNotice(noticeId) {
    if (!noticeId) {throw new Error('Notice ID required.');}
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.DELETE_NOTICE, {id: noticeId});
  },

  async togglePin(noticeId, currentPinned) {
    if (!noticeId) {throw new Error('Notice ID required.');}
    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.TOGGLE_NOTICE_PIN, {
      id: noticeId,
      pinned: !currentPinned,
    });
  },
};

export default noticesService;
