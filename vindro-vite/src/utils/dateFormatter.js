const formatDate = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);

    return new Intl.DateTimeFormat('en-GB', { // 'en-GB' gives you DD/MM/YYYY
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

export default formatDate;