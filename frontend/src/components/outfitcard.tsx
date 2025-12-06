function OutfitCard({
  outfit,
  items,
  styleName,
  onView,
  onDelete,
}: {
  outfit: Outfit;
  items: ClothingItem[];
  styleName: string;
  onView: (outfit: Outfit) => void;
  onDelete: (id: string) => void;
}) {
  const { status, url, trigger } = useVisualization(
    outfit._id,
    outfit.visualization_status ||
      (outfit.visualization_key ? "completed" : "none")
  );

  const visualizationUrl = url || outfit.visualization_url;
  const isPending = status === "pending";
  const hasVisual = status === "completed" && visualizationUrl;

  return (
    <Card className="group overflow-hidden border-muted transition-all duration-300 hover:shadow-lg hover:border-primary/20 flex flex-col">
      <div className="p-4 pb-0 relative">
        <div
          className="cursor-pointer transition-transform duration-500 hover:scale-[1.02]"
          onClick={() => onView(outfit)}
        >
          {hasVisual ? (
            <img
              src={visualizationUrl}
              alt={outfit.name}
              className="w-full h-full object-cover transition-opacity rounded-md"
              loading="lazy"
            />
          ) : isPending ? (
            <div className="aspect-square w-full bg-muted/30 rounded-md flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Generating...
              </span>
            </div>
          ) : (
            <MiniOutfitPreview items={items} />
          )}
        </div>
        {/* {hasVisual && (
          <div className="absolute top-6 right-6 pointer-events-none">
            <Badge className="bg-purple-600 shadow-md gap-1">
              <Sparkles className="w-3 h-3" /> AI Visual
            </Badge>
          </div>
        )} */}

        {status === "none" && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-2 right-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              trigger();
            }}
          >
            <ImagePlus className="w-3 h-3" /> Generate
          </Button>
        )}

        {status === "failed" && (
          <Button
            size="sm"
            variant="outline"
            className="absolute bottom-2 right-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              trigger();
            }}
          >
            <ImagePlus className="w-3 h-3" /> Retry
          </Button>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          {/* Added flex-1 and min-w-0. This prevents the text from overlapping the button */}
          <div className="flex-1 min-w-0">
            <h3
              // Removed 'truncate' and 'break'. using only line-clamp-2 for multi-line shortening
              className="font-semibold text-lg leading-tight line-clamp-2"
              title={outfit.name}
            >
              {outfit.name || "Untitled Outfit"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 truncate">
              <span className="w-2 h-2 rounded-full bg-primary/40 inline-block shrink-0" />
              <span className="truncate">{styleName}</span>
            </p>
          </div>

          {/* Added shrink-0 so the button size is preserved */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(outfit)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {status === "none" && (
                <DropdownMenuItem onClick={() => trigger()}>
                  <ImagePlus className="mr-2 h-4 w-4" /> Generate Visual
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(outfit._id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardFooter className="mt-auto pt-0 pb-4 px-4 flex gap-2 overflow-x-auto no-scrollbar">
        {outfit.weather && (
          <Badge
            variant="secondary"
            className="text-xs font-normal whitespace-nowrap"
          >
            <CloudSun className="mr-1 w-3 h-3" /> {outfit.weather}
          </Badge>
        )}
        {outfit.occasion && (
          <Badge
            variant="secondary"
            className="text-xs font-normal whitespace-nowrap"
          >
            <Calendar className="mr-1 w-3 h-3" /> {outfit.occasion}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
