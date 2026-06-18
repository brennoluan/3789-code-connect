'use client';

import { useRef } from 'react';
import { Modal } from '../Modal';
import styles from './replymodal.module.css';
import { Textarea } from '../Textarea';
import { SubmitButton } from '../SubmitButton';
import { Comment } from '../Comment';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const ReplyModal = ({ comment, slug }) => {
  const queryClient = useQueryClient();

  const modalRef = useRef(null);

  const openModal = () => {
    modalRef.current.openModal();
  };

  const closeModal = () => {
    modalRef.current.closeModal();
  };

  const replyMutation = useMutation({
    mutationFn: (commentData) => {
      return fetch(`http://localhost:3000/api/comment/${comment.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status ${response.status}`);
        }

        return response.json();
      });
    },
    onSuccess: () => {
      closeModal();

      //invalidate queries
      queryClient.invalidateQueries(['post', slug]);
    },
    onError: (error, variables) => {
      console.error(
        `Erro ao salvar a resposta ao comentario do slug: ${variables.slug}`,
        { error },
      );
    },
  });

  const onSubmitCommentReply = (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const text = formData.get('text');

    replyMutation.mutate(
      { comment, text },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  };

  return (
    <>
      <Modal ref={modalRef}>
        <form onSubmit={onSubmitCommentReply}>
          <div className={styles.body}>
            <Comment comment={comment} />
          </div>
          <div className={styles.divider}></div>
          <Textarea
            required
            rows={8}
            name="text"
            placeholder="Digite aqui..."
          />
          <div className={styles.footer}>
            <SubmitButton>Responder</SubmitButton>
          </div>
        </form>
      </Modal>
      <button className={styles.btn} onClick={openModal}>
        Responder
      </button>
    </>
  );
};
