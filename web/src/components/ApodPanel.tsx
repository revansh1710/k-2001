import { useStrapiApod } from "../hooks/useStrapiApod";

const ApodPanel: React.FC = () => {
  const { apod, loading, error, refresh } = useStrapiApod();

  if (loading) return <div className="text-gray-400 p-4">Loading APOD…</div>;
  if (error) return <div className="text-red-400 p-4">Error: {error}</div>;
  if (!apod) return <div className="text-gray-400 p-4">No APOD available.</div>;

  return (
    <div className="bg-white/10 p-4 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Image or video */}
        <div className="flex-1 flex items-center justify-center">
          {apod.media_type === "image" ? (
            <img
              src={apod.url}
              alt={apod.title}
              className="max-h-[400px] w-auto rounded shadow-md"
            />
          ) : (
            <iframe
              title={apod.title}
              src={apod.url}
              className="w-full h-[400px] rounded"
              frameBorder={0}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          )}
        </div>

        {/* Details */}
        <div className="flex-shrink-0 max-w-lg">
          <h3 className="text-xl font-semibold mb-2">{apod.title}</h3>
          <p className="text-sm text-gray-300 mb-3">{apod.date}</p>
          <p className="text-sm text-gray-200 mb-4">
            {apod.explanation}
          </p>
          <div className="flex gap-2">
            {apod.hdurl && (
              <a
                href={apod.hdurl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded bg-sky-600 text-white text-sm"
              >
                View HD
              </a>
            )}
            <button
              onClick={refresh}
              className="px-3 py-1.5 rounded bg-gray-200 text-black text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ApodPanel;