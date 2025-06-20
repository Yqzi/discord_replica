function getChunkSize(length: number) {
    // Try to fit all items in 3 rows, but never exceed 5 per row
    return Math.min(5, Math.ceil(length / 3));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

export default function VoiceChannel() {
    let x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // Try with different lengths
    const chunkSize = getChunkSize(x.length);
    const chunked = chunkArray(x, chunkSize);

    return (
        <div className="w-full h-full bg-black flex flex-col gap-2 py-24">
            {chunked.map((row, rowIdx) => (
                <div
                    key={rowIdx}
                    className={`grid grid-cols-${chunkSize} gap-2 items-stretch h-full`}
                    style={{
                        gridTemplateColumns: `repeat(${chunkSize}, minmax(0, 1fr))`,
                    }}
                >
                    {row.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-gray-800 rounded p-4 flex-1 h-full"
                        >
                            Item {item}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
