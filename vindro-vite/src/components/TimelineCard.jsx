import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

function TimelineCard(props) {

  return (

    <div key={ props.cardNum }>
      <h3>
        <FaChevronRight />
        { props.title }
      </h3>
      <p>{ props.text }</p>
    </div>
  );
};


export default TimelineCard;